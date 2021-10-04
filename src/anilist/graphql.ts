import {
  MediaType,
  PageResponse,
  Response,
  MediaList,
  MediaResponse,
  MediaForAiring,
  MediaSubbed,
} from "./types/graphql";
import { searchByTypeGraphql } from "./queries/searchByTypeGraphql";
import axios, { AxiosResponse } from "axios";
import { searchGraphql } from "./queries/searchGraphql";
import { searchForAiringScheduleGraphql } from "./queries/searchForAiringScheduleGraphql";
import { searchForAiringScheduleByIdGraphql } from "./queries/searchForAiringScheduleByIdGraphql";
import { searchByIdsGraphql } from "./queries/searchByIdsGraphql";

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
  type?: MediaType
): Promise<PageResponse<MediaList>> => {
  return request<PageResponse<MediaList>>(
    searchByTypeGraphql,
    {
      search,
      type,
    }
  );
};
export const searchByQuery = async (
  search: string
): Promise<PageResponse<MediaList>> => {
  return request<PageResponse<MediaList>>(searchGraphql, {
    search,
  });
};

export const searchForAiringSchedule = async (
  search: string
): Promise<MediaResponse<MediaForAiring>> => {
  return request<MediaResponse<MediaForAiring>>(
    searchForAiringScheduleGraphql,
    {
      search,
    }
  );
};

export const searchForAiringScheduleById = async (
  id: number
): Promise<MediaResponse<MediaForAiring>> => {
  return request<MediaResponse<MediaForAiring>>(
    searchForAiringScheduleByIdGraphql,
    {
      id,
    }
  );
};

export const searchForUser = async (
  ids: number[]
): Promise<PageResponse<MediaSubbed>> => {
  return request<PageResponse<MediaSubbed>>(
    searchByIdsGraphql,
    {
      ids,
    }
  );
};
