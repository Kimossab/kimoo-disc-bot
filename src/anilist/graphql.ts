import {
  MediaType,
  PageResponse,
  Response,
  MediaList,
  MediaResponse,
  MediaForAiring,
  MediaSubbed,
  AiringScheduleResponse,
  NextAiring,
} from "./types/graphql";
import { searchByTypeGraphql } from "./queries/searchByTypeGraphql";
import axios, { AxiosResponse } from "axios";
import { searchGraphql } from "./queries/searchGraphql";
import { searchForAiringScheduleGraphql } from "./queries/searchForAiringScheduleGraphql";
import { searchByScheduleIdGraphql } from "./queries/searchByScheduleIdGraphql";
import { searchByIdsGraphql } from "./queries/searchByIdsGraphql";
import Logger from "../helper/logger";
import { getNextAiringGraphql } from "./queries/getNextAiringGraphql";

const ANILIST_GRAPHQL = "https://graphql.anilist.co";

const request = async <T>(
  graphql: string,
  variables: string_object<unknown>
): Promise<T> => {
  const response = await axios.post<
    string,
    AxiosResponse<Response<T>>
  >(
    ANILIST_GRAPHQL,
    JSON.stringify({
      query: graphql,
      variables,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  return response.data.data;
};

export const searchByQueryAndType = async (
  search: string,
  type?: MediaType,
  logger?: Logger
): Promise<PageResponse<MediaList> | null> => {
  try {
    const data = await request<PageResponse<MediaList>>(
      searchByTypeGraphql,
      {
        search,
        type,
      }
    );
    return data;
  } catch (e) {
    logger?.error(
      "searchByQueryAndType",
      search,
      type,
      `StatusCode: ${
        axios.isAxiosError(e)
          ? e.response?.status
          : "unknown"
      }`,
      (e as Error).message
    );
    return null;
  }
};
export const searchByQuery = async (
  search: string,
  logger?: Logger
): Promise<PageResponse<MediaList> | null> => {
  try {
    const data = await request<PageResponse<MediaList>>(
      searchGraphql,
      {
        search,
      }
    );
    return data;
  } catch (e) {
    logger?.error(
      "searchByQuery",
      search,
      `StatusCode: ${
        axios.isAxiosError(e)
          ? e.response?.status
          : "unknown"
      }`,
      (e as Error).message
    );
    return null;
  }
};

export const searchForAiringSchedule = async (
  search: string,
  logger?: Logger
): Promise<MediaResponse<MediaForAiring> | null> => {
  try {
    const data = await request<
      MediaResponse<MediaForAiring>
    >(searchForAiringScheduleGraphql, {
      search,
    });
    return data;
  } catch (e) {
    logger?.error(
      "searchForAiringSchedule",
      search,
      `StatusCode: ${
        axios.isAxiosError(e)
          ? e.response?.status
          : "unknown"
      }`,
      (e as Error).message
    );
    return null;
  }
};

export const searchByScheduleId = async (
  id: number,
  logger?: Logger
): Promise<AiringScheduleResponse | null> => {
  try {
    const data = await request<AiringScheduleResponse>(
      searchByScheduleIdGraphql,
      {
        id,
      }
    );
    return data;
  } catch (e) {
    logger?.error(
      "searchByScheduleId",
      id,
      `StatusCode: ${
        axios.isAxiosError(e)
          ? e.response?.status
          : "unknown"
      }`,
      (e as Error).message
    );
    return null;
  }
};

export const searchForUser = async (
  ids: number[],
  logger?: Logger
): Promise<PageResponse<MediaSubbed> | null> => {
  try {
    const data = await request<PageResponse<MediaSubbed>>(
      searchByIdsGraphql,
      {
        ids,
      }
    );
    return data;
  } catch (e) {
    logger?.error(
      "searchForUser",
      ids,
      `StatusCode: ${
        axios.isAxiosError(e)
          ? e.response?.status
          : "unknown"
      }`,
      (e as Error).message
    );
    return null;
  }
};

export const getNextAiringEpisode = async (
  id: number,
  logger?: Logger
): Promise<MediaResponse<NextAiring> | null> => {
  try {
    const data = await request<MediaResponse<NextAiring>>(
      getNextAiringGraphql,
      {
        id,
      }
    );
    return data;
  } catch (e) {
    logger?.error(
      "getNextAiring",
      id,
      `StatusCode: ${
        axios.isAxiosError(e)
          ? e.response?.status
          : "unknown"
      }`,
      (e as Error).message
    );
    return null;
  }
};
