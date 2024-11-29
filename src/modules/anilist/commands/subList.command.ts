import { CommandHandler, CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import { chunkArray } from "@/helper/common";
import {
  CreatePageCallback,
  InteractionPagination
} from "@/helper/interaction-pagination";
import Logger from "@/helper/logger";
import { addPagination, getApplication } from "@/state/store";

import { getUserSubs } from "../database";
import { searchForUser } from "../graphql/graphql";
import { AnilistRateLimit, RequestStatus } from "../helpers/rate-limiter";
import { mapSubListToEmbed } from "../mappers/mapSubListToEmbed";
import { MediaSubbedInfo } from "../types/graphql";
import { ApplicationCommandSubcommandOption } from "@/discord/rest/types.gen";
import { ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";

const definition: ApplicationCommandSubcommandOption = {
  name: "list",
  description: "List your subscriptions",
  type: ApplicationCommandOptionType.Subcommand,
  options: []
};

const updateUserSubListEmbed: CreatePageCallback<MediaSubbedInfo[]> = async (
  page,
  total,
  data
) => {
  return {
    data: {
      embeds: [mapSubListToEmbed(data, page, total)]
    }
  };
};

const handler = (rateLimiter: AnilistRateLimit): CommandHandler => {
  return async (data) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource
      });

      const subs = await getUserSubs(data.guild_id, data.member.user?.id || "");

      if (subs.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: "No subscriptions"
        });

        return;
      }
      const subsChunk = chunkArray(subs, 25);

      const animeInfo = [];

      for (const chunk of subsChunk) {
        const info = await searchForUser(
          rateLimiter,
          chunk.map((s) => s.animeId)
        );
        if (
          info.status === RequestStatus.OK &&
          info.data.Page.media.length > 0
        ) {
          animeInfo.push(...info.data.Page.media);
        }
      }

      if (animeInfo.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: "No subscriptions"
        });

        return;
      }

      const chunks = chunkArray<MediaSubbedInfo>(animeInfo, 25);

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

export default (
  logger: Logger,
  rateLimiter: AnilistRateLimit
): CommandInfo => ({
  definition,
  handler: handler(rateLimiter)
});
