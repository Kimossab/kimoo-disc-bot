import { CommandHandler, CommandInfo } from "#base-module";

import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "discord-api-types/v10";
import { AnilistRateLimit, RequestStatus } from "../helpers/rate-limiter";
import { MediaType } from "../types/graphql";
import { createInteractionResponse, editOriginalInteractionResponse } from "@/discord/rest";
import { getAiringSchedule } from "../graphql/graphql";
import { getApplication } from "@/state/store";
import { getOptions } from "@/helper/modules";
import { mapAiringScheduleToEmbed } from "../mappers/mapAiringScheduleToEmbed";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";

interface ScheduleCommandOptions {
  query: string;
  type: MediaType;
}

const definition: APIApplicationCommandOption = {
  name: "schedule",
  description: "Search for an anime airing schedule",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "query",
      description: "Query to search for",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

const handler = (
  _logger: Logger,
  rateLimiter: AnilistRateLimit,
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id) {
      await createInteractionResponse(data.id, data.token, { type: InteractionResponseType.DeferredChannelMessageWithSource });

      const { query } = getOptions<ScheduleCommandOptions>(
        ["query"],
        option.options,
      );

      const allData = await getAiringSchedule(rateLimiter, query);

      if (allData.status !== RequestStatus.OK || !allData.data.Media) {
        await editOriginalInteractionResponse(app.id, data.token, { content: messageList.anilist.not_found });
        return;
      }

      const embed = mapAiringScheduleToEmbed(allData.data.Media);
      await editOriginalInteractionResponse(app.id, data.token, {
        content: "",
        embeds: [embed],
      });
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
