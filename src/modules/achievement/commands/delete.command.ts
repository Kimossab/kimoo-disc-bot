import { deleteAchievement } from "#achievement/database";
import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { stringReplacer } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptionValue } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackType,
} from "@/types/discord";

const definition: ApplicationCommandOption = {
  name: "delete",
  description: "Deletes an achievement (admin only)",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "id",
      description: "Achievement id",
      type: ApplicationCommandOptionType.INTEGER,
      required: true,
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

      const id = getOptionValue<number>(option.options, "id");

      if (!id) {
        return;
      }

      await deleteAchievement(data.guild_id, id);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.achievements.update_success, {
          id,
        }),
      });

      logger.log(
        `Deleted achievement ${id} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
  isAdmin: true,
});
