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

interface ErrorData {
  data: {
    message: string;
    code: string;
    errors: unknown[];
  };
}

type ErrorType = Error | ErrorData;

const isErrorData = (error: Error | ErrorData): error is ErrorData => {
  return Object.prototype.hasOwnProperty.call(error, "data");
};

export default class RestRateLimitHandler {
  // class
  private _logger = new Logger("RestRateLimitHandler");

  private routeBucket: Record<string, string> = {};

  private rateLimits: Record<string, RateLimitObject> = {};

  private requester: AxiosInstance = axios.create({
    baseURL: `https://${process.env.DISCORD_DOMAIN}/api/v${process.env.API_V}`,
    headers: {
      authorization: `Bot ${process.env.TOKEN}`,
    },
  });

  private handleErrors = (place: string, e: ErrorType): void => {
    if (isErrorData(e)) {
      this._logger.error(
        `[${place}] ${e.data.code} - ${e.data.message}`,
        e.data.errors
      );
    } else {
      this._logger.error(`[${place}] ${e.message}`, JSON.stringify(e));
    }
  };

  private handleHeaders(
    headers: Record<string, string | string[] | undefined>
  ): RateLimitObject {
    return {
      limit: Number(headers["x-ratelimit-limit"]),
      remaining: Number(headers["x-ratelimit-remaining"]),
      reset: Number(headers["x-ratelimit-reset"]),
      resetAfter: Number(headers["x-ratelimit-reset-after"]),
      bucket: headers["x-ratelimit-bucket"] as string,
    };
  }

  private logMessage(
    path: string,
    bucket: string,
    remaining: number,
    limit: number,
    reset: number,
    message?: string
  ): string {
    const s = `[${path}][${bucket}][${remaining}/${limit}][${reset} s]`;
    return message ? `${s} ${message}` : s;
  }

  /**
   * Sends a request and handles rate limits
   * @param method HTTP request method (GET, POST, PUT, DELETE, etc.)
   * @param path URL to request
   * @param data Data to send for the request if available
   * @returns The response of the request or null in case of failure
   */
  public async request<T>(
    method: Method,
    path: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<T | null> {
    const bucket = this.routeBucket[path];
    const rateLimits = bucket ? this.rateLimits[bucket] : null;

    if (rateLimits) {
      const resetTimeMs = rateLimits.reset * 1000;
      const now = +new Date();

      if (rateLimits.remaining === 0 && resetTimeMs > now) {
        this._logger.error(
          this.logMessage(
            path,
            bucket ?? null,
            rateLimits.remaining,
            rateLimits.limit,
            rateLimits.resetAfter,
            "Rate limited"
          )
        );

        // rate limited
        return new Promise<T | null>((resolve) => {
          setTimeout(() => {
            resolve(this.request<T>(method, path, data, headers));
          }, resetTimeMs - now);
        });
      }
    }

    // not rate limited - ok

    let response: AxiosResponse<T> | null = null;
    try {
      const requestOptions: AxiosRequestConfig = {
        method,
        url: path,
        data,
      };

      if (headers) {
        requestOptions.headers = headers;
      }

      response = await this.requester.request<T>(requestOptions);

      const parsedHeaders = this.handleHeaders(response.headers);

      this.routeBucket[path] = parsedHeaders.bucket;
      this.rateLimits[parsedHeaders.bucket] = parsedHeaders;

      this._logger.log(
        this.logMessage(
          path,
          parsedHeaders.bucket,
          parsedHeaders.remaining,
          parsedHeaders.limit,
          parsedHeaders.resetAfter
        )
      );
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 429) {
        // rate limited

        const parsedHeaders = this.handleHeaders(e.response.headers);
        this._logger.error(
          this.logMessage(
            path,
            parsedHeaders.bucket,
            parsedHeaders.remaining,
            parsedHeaders.limit,
            parsedHeaders.resetAfter,
            "Rate limited"
          )
        );

        return new Promise<T | null>((resolve) => {
          setTimeout(() => {
            resolve(this.request<T>(method, path, data, headers));
          }, parsedHeaders.resetAfter);
        });
      }
      this.handleErrors(path, e as ErrorType);
    }

    return response ? response.data : null;
  }
}
