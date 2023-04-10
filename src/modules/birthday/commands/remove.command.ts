import { CommandInfo } from "#base-module";
import { deleteUserBirthday, getUserBirthday } from "#birthday/database";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { checkAdmin } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackType,
} from "@/types/discord";

interface RemoveCommandOptions {
  user: string;
}

const definition: ApplicationCommandOption = {
  name: "remove",
  description: "Removes someone's birthday from the database",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "user",
      description: "The user whose birthday you're removing",
      type: ApplicationCommandOptionType.USER,
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

      const isAdmin = await checkAdmin(data.guild_id, data.member);

      let user = (data.member || data).user?.id;

      if (isAdmin) {
        const options = getOptions<RemoveCommandOptions>(
          ["user"],
          option.options
        );

        user = options.user || user;
      }

      const bd = await getUserBirthday(data.guild_id, user || "");

      if (bd) {
        await deleteUserBirthday(bd);
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.remove_success,
        });
        logger.log(
          `Removed user ${user} birthday in ${data.guild_id} by ` +
            `${(data.member || data).user?.username}#${
              (data.member || data).user?.discriminator
            }`
        );
      } else {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.not_found,
        });
      }
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
