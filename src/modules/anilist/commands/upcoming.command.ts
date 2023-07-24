import { getUpcomingAnime } from "#anilist/graphql/graphql";
import { AnilistRateLimit } from "#anilist/helpers/rate-limiter";
import { mapUpcomingToEmbed } from "#anilist/mappers/mapUpcomingToEmbed";
import { MediaSeason } from "#anilist/types/graphql";
import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import {
  CreatePageCallback,
  InteractionPagination,
} from "@/helper/interaction-pagination";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { addPagination, getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  Embed,
  InteractionCallbackType,
} from "@/types/discord";

interface UpcomingCommandOptions {
  season: MediaSeason | null;
}

const definition: ApplicationCommandOption = {
  name: "upcoming",
  description: "Shows a list of unaired animes.",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "season",
      description:
        "Season to get the upcoming animes, defaults to the next season.",
      type: ApplicationCommandOptionType.STRING,
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

const pageUpdate: CreatePageCallback<Embed> = async (_page, _total, data) => ({
  data: {
    embeds: [data],
  },
});

const handler = (
  logger: Logger,
  rateLimiter: AnilistRateLimit
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const options = getOptions<UpcomingCommandOptions>(
        ["season"],
        option.options
      );

      const season = options.season ?? getNextSeason();

      const allData = await getUpcomingAnime(rateLimiter, season);

      if (!allData) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.anilist.not_found,
        });
        return;
      }

      const embedList = mapUpcomingToEmbed(logger, allData);

      if (embedList.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.anilist.not_found,
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
  handler: handler(logger, rateLimiter),
});
