import { getAllUserAchievements } from "#achievement/database";
import { IUserAchievement } from "#achievement/models/user-achievement.model";
import { updateUserAchievementsPage } from "#achievement/pagination";
import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { chunkArray } from "@/helper/common";
import { InteractionPagination } from "@/helper/interaction-pagination";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptionValue } from "@/helper/modules";
import { addPagination, getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackType,
} from "@/types/discord";

const definition: ApplicationCommandOption = {
  name: "user",
  description: "Lists user achievements",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "user",
      description: "User to list",
      type: ApplicationCommandOptionType.USER,
    },
  ],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const user = option
        ? getOptionValue<string>(option.options, "user")
        : null;
      const userId = user || data.member.user?.id || "unknown-id";

      const userAchievements = await getAllUserAchievements(
        data.guild_id,
        userId
      );

      if (userAchievements.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.achievements.user_no_achievements,
        });

        return;
      }

      const chunks = chunkArray<IUserAchievement>(userAchievements, 10);

      const pagination = new InteractionPagination(
        app.id,
        chunks,
        updateUserAchievementsPage
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);

      logger.info(
        `List user ${userId} achievements in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
