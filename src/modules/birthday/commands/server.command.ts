import { CommandInfo } from "#base-module";

import { editOriginalInteractionResponse } from "@/discord/rest";
import { snowflakeToDate, stringReplacer } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

const definition: ApplicationCommandOption = {
  name: "server",
  description: "Shows the server's birthday",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      const serverDate = snowflakeToDate(data.guild_id);
      const birthdayString = `${serverDate.getDate()}/${
        serverDate.getMonth() + 1
      }/${serverDate.getFullYear()}`;

      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.birthday.server, {
          date: birthdayString,
        }),
      });

      logger.log(
        `Get server birthday date in ${data.guild_id} by ` +
          `${(data.member || data).user?.username}#${
            (data.member || data).user?.discriminator
          }`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
