import {
  MediaType,
  PageResponse,
  Response,
  MediaList,
  MediaResponse,
  MediaForAiring,
  MediaSubbed,
  AiringScheduleResponse,
} from "./types/graphql";
import { searchByTypeGraphql } from "./queries/searchByTypeGraphql";
import axios, { AxiosResponse } from "axios";
import { searchGraphql } from "./queries/searchGraphql";
import { searchForAiringScheduleGraphql } from "./queries/searchForAiringScheduleGraphql";
import { searchByScheduleIdGraphql } from "./queries/searchByScheduleIdGraphql";
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

export const searchByScheduleId = async (
  id: number
): Promise<AiringScheduleResponse> => {
  return request<AiringScheduleResponse>(
    searchByScheduleIdGraphql,
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
