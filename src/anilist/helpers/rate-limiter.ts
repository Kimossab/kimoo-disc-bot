import axios, { AxiosResponse } from "axios";
import Logger from "../../helper/logger";
import { Response } from "../types/graphql";

const X_RATELIMIT_LIMIT = "x-ratelimit-limit";
const X_RATELIMIT_REMAINING = "x-ratelimit-remaining";
const X_RATELIMIT_RESET = "x-ratelimit-reset";
const ANILIST_GRAPHQL = "https://graphql.anilist.co";

const TIMEOUT = 667; // 1 request per each 667ms max

interface RequestData<T = unknown> {
  name: string;
  graphql: string;
  variables: Record<string, unknown>;
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

const isErrorData = (
  error: Error | ErrorData
): error is ErrorData => {
  return Object.prototype.hasOwnProperty.call(
    error,
    "data"
  );
};

export interface IAnilistRateLimit {
  request<T>(
    queryName: string,
    graphql: string,
    variables: Record<string, unknown>
  ): Promise<T | null>;
}

export class AnilistRateLimit implements IAnilistRateLimit {
  private _logger = new Logger("AnilistRateLimit");
  private queue: RequestData[] = [];
  private timerActive = false;

  public async request<T>(
    queryName: string,
    graphql: string,
    variables: Record<string, unknown>
  ): Promise<T | null> {
    return new Promise<T>((resolve) => {
      this.queue.push({
        name: queryName,
        graphql,
        variables,
        callback: (data) => resolve(data as T),
      });
      if (!this.timerActive) {
        this.checkQueue();
      }
    });
  }

  private handleErrors = (
    place: string,
    e: ErrorType
  ): void => {
    if (isErrorData(e)) {
      this._logger.error(
        `[${place}] ${e.data.code} - ${e.data.message}`,
        e.data.errors
      );
    } else {
      this._logger.error(
        `[${place}] ${e.message}`,
        JSON.stringify(e)
      );
    }
  };

  private logSuccess(
    name: string,
    headers: AxiosResponse["headers"]
  ) {
    this._logger.log(
      `[${name}][${headers[X_RATELIMIT_REMAINING]} / ${headers[X_RATELIMIT_LIMIT]}] Success.`
    );
  }

  private async checkQueue() {
    if (this.queue.length === 0) {
      this.timerActive = false;
      return;
    }
    this.timerActive = true;

    const request = this.queue.shift();

    if (!request) {
      return;
    }

    try {
      const response = await this.doRequest<unknown>(
        request.graphql,
        request.variables
      );

      this.logSuccess(request.name, response.headers);

      request.callback(response.data.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (
          e.response?.status === 429 &&
          !!e.response.headers[X_RATELIMIT_RESET]
        ) {
          const nextRequest = Number(
            e.response.headers[X_RATELIMIT_RESET]
          );

          this.queue.unshift(request);

          const now = +new Date();

          let timeoutTime = nextRequest - now;
          if (nextRequest <= now) {
            timeoutTime = TIMEOUT;
          }

          this._logger.error(
            `[${request.name}] Rate limited. Next request in ${timeoutTime}ms`
          );

          setTimeout(() => {
            this.checkQueue();
          }, timeoutTime);

          //no need to callback because we're going to request again

          return;
        }

        request.callback(null);

        if (e.response?.status !== 404) {
          this.handleErrors(request.name, e);
        }
      } else {
        this.handleErrors(request.name, e as ErrorType);
      }
    }

    setTimeout(() => {
      this.checkQueue();
    }, TIMEOUT);
  }

  private async doRequest<T>(
    graphql: string,
    variables: Record<string, unknown>
  ): Promise<AxiosResponse<Response<T>>> {
    const response = await axios.post<
      string,
      AxiosResponse<Response<T>>
    >(
      ANILIST_GRAPHQL,
      JSON.stringify({
        query: graphql,
        variables: variables,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response;
  }
}
