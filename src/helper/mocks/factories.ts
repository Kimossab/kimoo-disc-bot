import { IAnilistSubscription } from "#anilist/models/AnilistSubscription.model";
import {
  MediaResponse,
  MediaSubbed,
  MediaSubbedInfo,
  NextAiringWithTitle,
  PageResponse,
} from "#anilist/types/graphql";

import casual from "casual";

const randomUserSub = (): Partial<IAnilistSubscription> => ({
  id: casual.integer(),
  user: casual.integer().toString(),
  server: casual.integer().toString(),
});

export const manyUserSubs = (
  count: number
): Partial<IAnilistSubscription>[] => {
  return Array.from({ length: count }, randomUserSub);
};

const randomMediaSubbedInfo = (): MediaSubbedInfo =>
  ({
    siteUrl: casual.url,
    title: {
      english: casual.title,
    },
  } as MediaSubbedInfo);

export const manyUserSubsAnilist = (
  count: number
): PageResponse<MediaSubbed> => {
  return {
    Page: {
      pageInfo: {
        total: count,
        currentPage: 1,
        lastPage: 1,
        hasNextPage: false,
        perPage: count,
      },
      media: Array.from({ length: count }, randomMediaSubbedInfo),
    },
  };
};
export const randomAiringSchedule = (): MediaResponse<NextAiringWithTitle> => ({
  Media: {
    id: casual.integer(),
    title: {
      english: casual.title,
      native: casual.title,
      romaji: casual.title,
      userPreferred: casual.title,
    },
    isAdult: casual.boolean,
    nextAiringEpisode: null,
    coverImage: {
      color: casual.color_name,
      extraLarge: casual.url,
      large: casual.url,
      medium: casual.url,
    },
    siteUrl: casual.url,
    airingSchedule: {
      nodes: null,
    },
  },
});
