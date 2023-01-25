import { CommandInfo } from "#base-module";

import { editOriginalInteractionResponse } from "@/discord/rest";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

import { getAiringSchedule } from "../graphql/graphql";
import { AnilistRateLimit } from "../helpers/rate-limiter";
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
      required: true,
    },
  ],
};

const handler = (
  _logger: Logger,
  rateLimiter: AnilistRateLimit
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id) {
      const { query } = getOptions<ScheduleCommandOptions>(
        ["query"],
        option.options
      );

      const allData = await getAiringSchedule(rateLimiter, query);

      if (!allData?.Media) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.anilist.not_found,
        });
        return;
      }

      const embed = mapAiringScheduleToEmbed(allData.Media);
      await editOriginalInteractionResponse(app.id, data.token, {
        content: "",
        embeds: [embed],
      });
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
