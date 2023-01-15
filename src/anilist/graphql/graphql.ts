import {
  MediaType,
  PageResponse,
  MediaList,
  MediaResponse,
  MediaForAiring,
  MediaSubbed,
  AiringScheduleResponse,
  NextAiring,
  NextAiringWithTitle,
} from "../types/graphql";
import { searchByTypeGraphql } from "./queries/searchByTypeGraphql";
import { searchGraphql } from "./queries/searchGraphql";
import { searchForAiringScheduleGraphql } from "./queries/searchForAiringScheduleGraphql";
import { searchByScheduleIdGraphql } from "./queries/searchByScheduleIdGraphql";
import { searchByIdsGraphql } from "./queries/searchByIdsGraphql";
import { getNextAiringGraphql } from "./queries/getNextAiringGraphql";
import { getAiringScheduleGraphql } from "./queries/getAiringScheduleGraphql";
import { IAnilistRateLimit } from "../helpers/rate-limiter";

export const searchByQueryAndType = async (
  rateLimiter: IAnilistRateLimit,
  search: string,
  type?: MediaType
): Promise<PageResponse<MediaList> | null> => {
  return await rateLimiter.request<PageResponse<MediaList>>(
    "searchByQueryAndType",
    searchByTypeGraphql,
    {
      search,
      type,
    }
  );
};
export const searchByQuery = async (
  rateLimiter: IAnilistRateLimit,
  search: string
): Promise<PageResponse<MediaList> | null> => {
  return await rateLimiter.request<PageResponse<MediaList>>(
    "searchByQuery",
    searchGraphql,
    {
      search,
    }
  );
};

export const searchForAiringSchedule = async (
  rateLimiter: IAnilistRateLimit,
  search: string
): Promise<MediaResponse<MediaForAiring> | null> => {
  return await rateLimiter.request<
    MediaResponse<MediaForAiring>
  >(
    "searchForAiringSchedule",
    searchForAiringScheduleGraphql,
    {
      search,
    }
  );
};

export const searchByScheduleId = async (
  rateLimiter: IAnilistRateLimit,
  id: number
): Promise<AiringScheduleResponse | null> => {
  return await rateLimiter.request<AiringScheduleResponse>(
    "searchByScheduleId",
    searchByScheduleIdGraphql,
    {
      id,
    }
  );
};

export const searchForUser = async (
  rateLimiter: IAnilistRateLimit,
  ids: number[]
): Promise<PageResponse<MediaSubbed> | null> => {
  return await rateLimiter.request<
    PageResponse<MediaSubbed>
  >("searchForUser", searchByIdsGraphql, {
    ids,
  });
};

export const getNextAiringEpisode = async (
  rateLimiter: IAnilistRateLimit,
  id: number
): Promise<MediaResponse<NextAiring> | null> => {
  return await rateLimiter.request<
    MediaResponse<NextAiring>
  >("getNextAiring", getNextAiringGraphql, {
    id,
  });
};

export const getAiringSchedule = async (
  rateLimiter: IAnilistRateLimit,
  search: string
): Promise<MediaResponse<NextAiringWithTitle> | null> => {
  return await rateLimiter.request<
    MediaResponse<NextAiringWithTitle>
  >("getAiringSchedule", getAiringScheduleGraphql, {
    search,
  });
};