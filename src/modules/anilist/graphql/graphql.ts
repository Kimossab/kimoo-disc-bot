import { IAnilistRateLimit } from "../helpers/rate-limiter";
import {
  InfoWithSchedule,
  MediaForAiring,
  MediaList,
  MediaResponse,
  MediaSeason,
  MediaSubbed,
  MediaType,
  NextAiringWithTitle,
  PageResponse,
  UpcomingMedia,
} from "../types/graphql";
import { getAiringScheduleGraphql } from "./queries/getAiringScheduleGraphql";
import { getFullAiringScheduleGraphql } from "./queries/getFullAiringScheduleGraphql";
import { getUpcoming } from "./queries/getUpcoming";
import { searchByIdsGraphql } from "./queries/searchByIdsGraphql";
import { searchByTypeGraphql } from "./queries/searchByTypeGraphql";
import { searchForAiringScheduleGraphql } from "./queries/searchForAiringScheduleGraphql";
import { searchGraphql } from "./queries/searchGraphql";

export const searchByQueryAndType = async (
  rateLimiter: IAnilistRateLimit,
  search: string,
  type?: MediaType,
) => {
  return await rateLimiter.request<PageResponse<MediaList>>(
    "searchByQueryAndType",
    searchByTypeGraphql,
    {
      search,
      type,
    },
  );
};
export const searchByQuery = async (
  rateLimiter: IAnilistRateLimit,
  search: string,
) => {
  return await rateLimiter.request<PageResponse<MediaList>>(
    "searchByQuery",
    searchGraphql,
    { search },
  );
};

export const searchForAiringSchedule = async (
  rateLimiter: IAnilistRateLimit,
  search: string,
) => {
  return await rateLimiter.request<MediaResponse<MediaForAiring>>(
    "searchForAiringSchedule",
    searchForAiringScheduleGraphql,
    { search },
  );
};

export const searchForUser = async (
  rateLimiter: IAnilistRateLimit,
  ids: number[],
) => {
  return await rateLimiter.request<PageResponse<MediaSubbed>>(
    "searchForUser",
    searchByIdsGraphql,
    { ids },
  );
};

export const getAiringSchedule = async (
  rateLimiter: IAnilistRateLimit,
  search: string,
) => {
  return await rateLimiter.request<MediaResponse<NextAiringWithTitle>>(
    "getAiringSchedule",
    getAiringScheduleGraphql,
    { search },
  );
};

export const getFullAiringSchedule = async (
  rateLimiter: IAnilistRateLimit,
  id: number,
) => {
  return await rateLimiter.request<MediaResponse<InfoWithSchedule>>(
    "getFullAiringScheduleGraphql",
    getFullAiringScheduleGraphql,
    { id },
  );
};

export const getUpcomingAnime = async (
  rateLimiter: IAnilistRateLimit,
  season: MediaSeason,
) => {
  return await rateLimiter.request<PageResponse<UpcomingMedia>>(
    "getUpcoming",
    getUpcoming,
    { season },
  );
};
