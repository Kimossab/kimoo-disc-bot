import { editOriginalInteractionResponse } from "../../discord/rest";
import Logger from "../../helper/logger";
import messageList from "../../helper/messages";
import { getOptions } from "../../helper/modules";
import { getApplication } from "../../state/store";
import { getAiringSchedule } from "../graphql/graphql";
import { mapAiringScheduleToEmbed } from "../mappers/mapAiringScheduleToEmbed";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import { MediaType } from "../types/graphql";

interface ScheduleCommandOptions {
  query: string;
  type: MediaType;
}

export const scheduleCommand = (
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

      const allData = await getAiringSchedule(
        rateLimiter,
        query
      );

      if (!allData?.Media) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.anilist.not_found,
          }
        );
        return;
      }

      const embed = mapAiringScheduleToEmbed(allData.Media);
      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: "",
          embeds: [embed],
        }
      );
    }
  };
};
