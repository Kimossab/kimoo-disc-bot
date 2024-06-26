import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackType
} from "@/types/discord";

import { getAiringSchedule } from "../graphql/graphql";
import { AnilistRateLimit, RequestStatus } from "../helpers/rate-limiter";
import { mapAiringScheduleToEmbed } from "../mappers/mapAiringScheduleToEmbed";
import { MediaType } from "../types/graphql";

interface ScheduleCommandOptions {
  query: string;
  type: MediaType;
}

const definition: ApplicationCommandOption = {
  name: "schedule",
  description: "Search for an anime airing schedule",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "query",
      description: "Query to search for",
      type: ApplicationCommandOptionType.STRING,
      required: true
    }
  ]
};

const handler = (
  _logger: Logger,
  rateLimiter: AnilistRateLimit
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
      });

      const { query } = getOptions<ScheduleCommandOptions>(
        ["query"],
        option.options
      );

      const allData = await getAiringSchedule(rateLimiter, query);

      if (allData.status !== RequestStatus.OK || !allData.data.Media) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.anilist.not_found
        });
        return;
      }

      const embed = mapAiringScheduleToEmbed(allData.data.Media);
      await editOriginalInteractionResponse(app.id, data.token, {
        content: "",
        embeds: [embed]
      });
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
