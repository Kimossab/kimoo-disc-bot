import axios, { AxiosResponse } from "axios";
import Logger from "../helper/logger";
import { Response } from "./types/graphql";

const X_RATELIMIT_LIMIT = "x-ratelimit-limit";
const X_RATELIMIT_REMAINING = "x-ratelimit-remaining";
const X_RATELIMIT_RESET = "x-ratelimit-reset";
const ANILIST_GRAPHQL = "https://graphql.anilist.co";

const TIMEOUT = 667; // 1 request per each 667ms max

interface RequestData<T = unknown> {
  name: string;
  graphql: string;
  variables: string_object<unknown>;
  callback: (data: T | null) => void;
}

export class AnilistRateLimit {
  private _logger = new Logger("AnilistRateLimit");
  private queue: RequestData[] = [];

  constructor() {
    this.checkQueue();
  }

  private handleErrors(place: string, e: any): void {
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
  }

  private logSuccess(
    name: string,
    headers: Record<string, string>
  ) {
    this._logger.log(
      `[${name}][${headers[X_RATELIMIT_REMAINING]} / ${headers[X_RATELIMIT_LIMIT]}] Success.`
    );
  }

  private async checkQueue() {
    if (this.queue.length === 0) {
      setTimeout(() => {
        this.checkQueue();
      }, TIMEOUT);
      return;
    }

    const request = this.queue.shift()!;
    try {
      const response = await this.doRequest<unknown>(
        request.graphql,
        request.variables
      );

      this.logSuccess(request.name, response.headers);

      request.callback(response.data.data);
    } catch (e) {
      if (
        axios.isAxiosError(e) &&
        e.response?.status === 429
      ) {
        const nextRequest =
          +e.response.headers[X_RATELIMIT_RESET];

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

        return;
      }
      this.handleErrors(request.name, e);
    }

    setTimeout(() => {
      this.checkQueue();
    }, TIMEOUT);
  }

  public async request<T>(
    queryName: string,
    graphql: string,
    variables: string_object<unknown>
  ): Promise<T | null> {
    return new Promise<T>((resolve) => {
      this.queue.push({
        name: queryName,
        graphql,
        variables,
        callback: (data) => resolve(data as T),
      });
    });
  }

  private async doRequest<T>(
    graphql: string,
    variables: string_object<unknown>
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
