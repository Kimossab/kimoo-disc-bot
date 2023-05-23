import Logger from "@/helper/logger";

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from "axios";

interface RateLimitObject {
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  bucket: string;
}

interface RequestData<T = unknown> {
  method: Method;
  path: string;
  data?: unknown;
  headers?: Record<string, string>;
  callback: (data: T | null) => void;
}

interface ErrorData {
  data: {
    message: string;
    code: string;
    errors: unknown[];
  };
}

type ErrorType = Error | ErrorData;

const topLevelBucketPath = (path: string): string => {
  const match = /^(?<bucketPath>\/[^/]*\/[^/]*)/g.exec(path);

  return match?.groups?.bucketPath || "unknown";
};

const isErrorData = (error: Error | ErrorData): error is ErrorData => {
  return Object.prototype.hasOwnProperty.call(error, "data");
};

export default class RestRateLimitHandler {
  private _logger = new Logger("RestRateLimitHandler");
  private queueBucket: Record<string, RequestData[]> = {};
  private busyBucket: Record<string, boolean> = {};

  private requester: AxiosInstance = axios.create({
    baseURL: `https://${process.env.DISCORD_DOMAIN}/api/v${process.env.API_V}`,
    headers: {
      authorization: `Bot ${process.env.TOKEN}`,
    },
  });

  private handleErrors = (place: string, e: ErrorType): void => {
    if (isErrorData(e)) {
      this._logger.error(e.data.message, {
        place,
        code: e.data.code,
        errors: e.data.errors,
      });
    } else {
      this._logger.error(e.message, {
        place,
        errors: e,
      });
    }
  };

  private handleHeaders(headers: AxiosResponse["headers"]): RateLimitObject {
    return {
      limit: Number(headers["x-ratelimit-limit"]),
      remaining: Number(headers["x-ratelimit-remaining"]),
      reset: Number(headers["x-ratelimit-reset"]),
      resetAfter: Number(headers["x-ratelimit-reset-after"]),
      bucket: headers["x-ratelimit-bucket"] as string,
    };
  }

  private async checkQueue(bucket: string) {
    if (this.busyBucket[bucket]) {
      return;
    }

    this.busyBucket[bucket] = true;

    const req = this.queueBucket[bucket]?.shift();

    if (!req) {
      this.busyBucket[bucket] = false;
      return;
    }

    const { callback, method, path, data, headers } = req;

    try {
      const requestOptions: AxiosRequestConfig = {
        method,
        url: path,
        data,
      };

      if (headers) {
        requestOptions.headers = headers;
      }

      const response = await this.requester.request(requestOptions);

      const parsedHeaders = this.handleHeaders(response.headers);

      this._logger.info("Success request", {
        path,
        ...parsedHeaders,
      });
      callback(response ? response.data : null);

      if (parsedHeaders.remaining === 0) {
        this._logger.info("Rate Limit. Waiting...", {
          myBucket: bucket,
          ...parsedHeaders,
        });
        setTimeout(() => {
          this.busyBucket[bucket] = false;
          this.checkQueue(bucket);
        }, parsedHeaders.resetAfter * 1000);

        return;
      }

      this.busyBucket[bucket] = false;
      this.checkQueue(bucket);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 429) {
        // rate limited

        const parsedHeaders = this.handleHeaders(e.response.headers);
        this._logger.error(
          `Rate limited - made a request - Bucket: ${bucket}`,
          {
            path,
            ...parsedHeaders,
          }
        );

        this.queueBucket[bucket].unshift(req);

        setTimeout(() => {
          this.busyBucket[bucket] = false;
          this.checkQueue(bucket);
        }, parsedHeaders.resetAfter * 1000);
      } else {
        this.busyBucket[bucket] = false;
        callback(null);
      }

      this.handleErrors(path, e as ErrorType);
    }
  }

  public async request<T>(
    method: Method,
    path: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<T | null> {
    const bucketPath = topLevelBucketPath(path);

    return new Promise<T>((resolve) => {
      if (this.queueBucket[bucketPath]) {
        this.queueBucket[bucketPath].push({
          method,
          path,
          data,
          headers,
          callback: (data) => resolve(data as T),
        });
      } else {
        this.queueBucket[bucketPath] = [
          {
            method,
            path,
            data,
            headers,
            callback: (data) => resolve(data as T),
          },
        ];
      }
      this.checkQueue(bucketPath);
    });
  }
}
