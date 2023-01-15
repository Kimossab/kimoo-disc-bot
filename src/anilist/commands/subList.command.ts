import { editOriginalInteractionResponse } from "../../discord/rest";
import { chunkArray } from "../../helper/common";
import {
  CreatePageCallback,
  InteractionPagination,
} from "../../helper/interaction-pagination";
import Logger from "../../helper/logger";
import {
  getApplication,
  addPagination,
} from "../../state/store";
import { getUserSubs } from "../database";
import { searchForUser } from "../graphql/graphql";
import { mapSubListToEmbed } from "../mappers/mapSubListToEmbed";
import { IAnilistSubscription } from "../models/AnilistSubscription.model";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import { MediaSubbedInfo } from "../types/graphql";

const updateUserSubListEmbed: CreatePageCallback<
  MediaSubbedInfo[]
> = async (page, total, data) => {
  return {
    data: {
      embeds: [mapSubListToEmbed(data, page, total)],
    },
  };
};

export const subListCommand = (
  logger: Logger,
  rateLimiter: AnilistRateLimit
): CommandHandler => {
  return async (data) => {
    const app = getApplication();
    if (app && app.id) {
      const subs = await getUserSubs(
        data.guild_id,
        data.member.user?.id || ""
      );

      if (subs.length === 0) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: "No subscriptions",
          }
        );

        return;
      }
      const subsChunk = chunkArray<IAnilistSubscription>(
        subs,
        25
      );

      const animeInfo = [];

      for (const chunk of subsChunk) {
        const info = await searchForUser(
          rateLimiter,
          chunk.map((s) => s.id)
        );

        logger.log("test", info, data);

        if (info && info.Page.media.length > 0) {
          animeInfo.push(...info.Page.media);
        }
      }

      if (animeInfo.length === 0) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: "No subscriptions",
          }
        );

        return;
      }

      const chunks = chunkArray<MediaSubbedInfo>(
        animeInfo,
        25
      );

      const pagination = new InteractionPagination(
        app.id,
        chunks,
        updateUserSubListEmbed
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);
    }
  };
};
