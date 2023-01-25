import { deleteRank } from "#achievement/database";
import { CommandInfo } from "#base-module";

import { editOriginalInteractionResponse } from "@/discord/rest";
import { checkAdmin } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptionValue } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

const definition: ApplicationCommandOption = {
  name: "delete",
  description: "Deletes a rank",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "name",
      description: "Rank name",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      if (!checkAdmin(data.guild_id, data.member)) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.common.no_permission,
        });
        return;
      }

      const name = getOptionValue<string>(option.options, "name");

      if (!name) {
        return;
      }

      await deleteRank(data.guild_id, name);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.achievements.rank_deleted,
      });

      logger.log(
        `Delete rank ${name} in ${data.guild_id} by ${data.member?.user?.username}#${data.member?.user?.discriminator}`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
