import { CommandHandler, CommandInfo } from "#base-module";
import { deleteUserBirthday, getUserBirthday } from "#birthday/database";

import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import { ApplicationCommandSubcommandOption } from "@/discord/rest/types.gen";
import { checkAdmin } from "@/helper/common";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import { ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";

interface RemoveCommandOptions {
  user: string;
}

const definition: ApplicationCommandSubcommandOption = {
  name: "remove",
  description: "Removes someone's birthday from the database",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "user",
      description: "The user whose birthday you're removing",
      type: ApplicationCommandOptionType.User,
      required: true
    }
  ]
};

const handler = (): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource
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
        await deleteUserBirthday(bd.id);
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.remove_success
        });
      } else {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.not_found
        });
      }
    }
  };
};

export default (): CommandInfo => ({
  definition,
  handler: handler()
});
