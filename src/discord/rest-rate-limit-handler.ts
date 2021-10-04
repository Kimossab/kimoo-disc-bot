import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from "axios";
import Logger from "../helper/logger";

interface RateLimitObject {
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  bucket: string;
}

export default class RestRateLimitHandler {
  // class
  private _logger = new Logger("RestRateLimitHandler");

  private routeBucket: string_object<string> = {};

  private rateLimits: string_object<RateLimitObject> = {};

  private requester: AxiosInstance = axios.create({
    baseURL: `https://${process.env.DISCORD_DOMAIN}/api/v${process.env.API_V}`,
    headers: {
      authorization: `Bot ${process.env.TOKEN}`,
    },
  });

  private handleErrors = (place: string, e: any): void => {
    if (e.data) {
      this._logger.error(
        `[${place}] ${e.data.code} - ${e.data.message}`,
        e.data.errors
      );
    } else {
      this._logger.error(
        `[${place}] ${e.message}`,
        e.toJSON()
      );
    }
  };

  private handleHeaders(
    headers: string_object<any>
  ): RateLimitObject {
    return {
      limit: Number(headers["x-ratelimit-limit"]),
      remaining: Number(headers["x-ratelimit-remaining"]),
      reset: Number(headers["x-ratelimit-reset"]),
      resetAfter: Number(
        headers["x-ratelimit-reset-after"]
      ),
      bucket: headers["x-ratelimit-bucket"],
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
    data?: any,
    headers?: string_object<string>
  ): Promise<T | null> {
    const bucket = this.routeBucket[path];
    const rateLimits = bucket
      ? this.rateLimits[bucket]
      : null;

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
            resolve(
              this.request<T>(method, path, data, headers)
            );
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

      response = await this.requester.request<T>(
        requestOptions
      );

      const parsedHeaders = this.handleHeaders(
        response.headers
      );

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
      if (
        axios.isAxiosError(e) &&
        e.response?.status === 429
      ) {
        // rate limited

        const parsedHeaders = this.handleHeaders(
          e.response.headers
        );
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
            resolve(
              this.request<T>(method, path, data, headers)
            );
          }, parsedHeaders.resetAfter);
        });
      }
      this.handleErrors(path, e);
    }

    return response ? response.data : null;
  }
}
