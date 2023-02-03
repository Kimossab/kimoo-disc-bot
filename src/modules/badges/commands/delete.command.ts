import { deleteBadge } from "#badges/database";
import { CommandInfo } from "#base-module";

import { editOriginalInteractionResponse } from "@/discord/rest";
import { deleteFile } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

interface NameOption {
  name: string;
}

const definition: ApplicationCommandOption = {
  name: "delete",
  description: "Deletes a badges",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "name",
      description: "Name of the badge",
      type: ApplicationCommandOptionType.STRING,
    },
  ],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      const { name } = getOptions<NameOption>(["name"], option.options);
      if (!name) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.badges.not_found,
        });
        return;
      }

      const badge = await deleteBadge(name, data.guild_id);

      if (!badge) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.badges.not_found,
        });
        return;
      }

      await deleteFile(`badges/${badge.name}.${badge.fileExtension}`);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: `Badge ${name} deleted`,
      });

      logger.log(
        `Delete badge ${name} by ${(data.member || data).user?.id} in ${
          data.guild_id
        } by ${(data.member || data).user?.username}#${
          (data.member || data).user?.discriminator
        }`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
  isAdmin: true,
});
