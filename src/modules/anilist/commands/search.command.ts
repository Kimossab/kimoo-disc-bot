import { CommandHandler, CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import {
  CreatePageCallback,
  InteractionPagination
} from "@/helper/interaction-pagination";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { addPagination, getApplication } from "@/state/store";

import { searchByQuery, searchByQueryAndType } from "../graphql/graphql";
import { AnilistRateLimit, RequestStatus } from "../helpers/rate-limiter";
import { mapMediaToEmbed } from "../mappers/mapMediaToEmbed";
import { MediaType } from "../types/graphql";
import { ApplicationCommandSubcommandOption, RichEmbed } from "@/discord/rest/types.gen";
import { ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";

interface SearchCommandOptions {
  query: string;
  type: MediaType;
}

const definition: ApplicationCommandSubcommandOption = {
  name: "search",
  description: "Search for an anime or manga",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "query",
      description: "Query to search for",
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "type",
      description: "Query to search for",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: MediaType.ANIME,
          value: MediaType.ANIME
        },
        {
          name: MediaType.MANGA,
          value: MediaType.MANGA
        }
      ]
    }
  ]
};

const pageUpdate: CreatePageCallback<RichEmbed> = async (_page, _total, data) => ({
  data: {
    embeds: [data]
  }
});

const handler = (
  logger: Logger,
  rateLimiter: AnilistRateLimit
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource
      });

      const { query, type } = getOptions<SearchCommandOptions>(
        ["query", "type"],
        option.options
      );

      const allData = await (type
        ? searchByQueryAndType(rateLimiter, query, type)
        : searchByQuery(rateLimiter, query));

      if (allData.status !== RequestStatus.OK) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.anilist.not_found
        });
        return;
      }

      const embedList = mapMediaToEmbed(allData.data);

      if (embedList.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.anilist.not_found
        });
        return;
      }

      const pagination = new InteractionPagination(
        app.id,
        embedList,
        pageUpdate
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
  handler: handler(logger, rateLimiter)
});
