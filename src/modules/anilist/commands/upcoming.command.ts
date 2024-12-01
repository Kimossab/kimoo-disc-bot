import { AnilistRateLimit, RequestStatus } from "#anilist/helpers/rate-limiter";
import { CommandHandler, CommandInfo } from "#base-module";
import { MediaSeason } from "#anilist/types/graphql";
import { getUpcomingAnime } from "#anilist/graphql/graphql";
import { mapUpcomingToEmbed } from "#anilist/mappers/mapUpcomingToEmbed";

import {
  APIApplicationCommandOption,
  APIEmbed,
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "discord-api-types/v10";
import { CreatePageCallback, InteractionPagination } from "@/helper/interaction-pagination";
import { addPagination, getApplication } from "@/state/store";
import { createInteractionResponse, editOriginalInteractionResponse } from "@/discord/rest";
import { getOptions } from "@/helper/modules";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";

interface UpcomingCommandOptions {
  season: MediaSeason | null;
}

const definition: APIApplicationCommandOption = {
  name: "upcoming",
  description: "Shows a list of unaired animes.",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "season",
      description:
        "Season to get the upcoming animes, defaults to the next season.",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: MediaSeason.WINTER,
          value: MediaSeason.WINTER,
        },
        {
          name: MediaSeason.SPRING,
          value: MediaSeason.SPRING,
        },
        {
          name: MediaSeason.SUMMER,
          value: MediaSeason.SUMMER,
        },
        {
          name: MediaSeason.FALL,
          value: MediaSeason.FALL,
        },
      ],
    },
  ],
};

const getNextSeason = (): MediaSeason => {
  const date = new Date();

  switch (date.getMonth()) {
    case 0:
    case 1:
    case 2:
      return MediaSeason.SPRING;
    case 3:
    case 4:
    case 5:
      return MediaSeason.SUMMER;
    case 6:
    case 7:
    case 8:
      return MediaSeason.FALL;
    case 9:
    case 10:
    case 11:
      return MediaSeason.WINTER;
  }

  return MediaSeason.WINTER;
};

const pageUpdate: CreatePageCallback<APIEmbed> = async (_page, _total, data) => ({ data: { embeds: [data] } });

const handler = (
  logger: Logger,
  rateLimiter: AnilistRateLimit,
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, { type: InteractionResponseType.DeferredChannelMessageWithSource });

      const options = getOptions<UpcomingCommandOptions>(
        ["season"],
        option.options,
      );

      const season = options.season ?? getNextSeason();

      const allData = await getUpcomingAnime(rateLimiter, season);

      if (allData.status !== RequestStatus.OK) {
        await editOriginalInteractionResponse(app.id, data.token, { content: messageList.anilist.not_found });
        return;
      }

      const embedList = mapUpcomingToEmbed(logger, allData.data);

      if (embedList.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, { content: messageList.anilist.not_found });
        return;
      }

      const pagination = new InteractionPagination(
        app.id,
        embedList,
        pageUpdate,
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);
    }
  };
};

export default (
  logger: Logger,
  rateLimiter: AnilistRateLimit,
): CommandInfo => ({
  definition,
  handler: handler(logger, rateLimiter),
});
