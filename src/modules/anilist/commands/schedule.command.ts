import { CommandHandler, CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import { getAiringSchedule } from "../graphql/graphql";
import { AnilistRateLimit, RequestStatus } from "../helpers/rate-limiter";
import { mapAiringScheduleToEmbed } from "../mappers/mapAiringScheduleToEmbed";
import { MediaType } from "../types/graphql";
import { ApplicationCommandSubcommandOption } from "@/discord/rest/types.gen";
import { ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";

interface ScheduleCommandOptions {
  query: string;
  type: MediaType;
}

const definition: ApplicationCommandSubcommandOption = {
  name: "schedule",
  description: "Search for an anime airing schedule",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "query",
      description: "Query to search for",
      type: ApplicationCommandOptionType.String,
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
        type: InteractionResponseType.DeferredChannelMessageWithSource
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
