import { CommandInfo } from "#base-module";
import { addBirthday, getUserBirthday } from "#birthday/database";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { interpolator } from "@/helper/common";
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

interface AddCommandOptions {
  day: number;
  month: number;
  year: number;
}

const definition: ApplicationCommandOption = {
  name: "add",
  description: "Adds your birthday to the database",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "day",
      description: "The day when you were born",
      type: ApplicationCommandOptionType.INTEGER,
      required: true,
    },
    {
      name: "month",
      description: "The month when you were born",
      type: ApplicationCommandOptionType.INTEGER,
      required: true,
    },
    {
      name: "year",
      description: "The year when they were born",
      type: ApplicationCommandOptionType.INTEGER,
    },
  ],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const { day, month, year } = getOptions<AddCommandOptions>(
        ["day", "month", "year"],
        option.options
      );

      const user = (data.member || data).user?.id || "";

      const bd = await getUserBirthday(data.guild_id, user);

      if (bd) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.already_set,
        });
        return;
      }

      await addBirthday(data.guild_id, user, day || -1, month || -1, year);

      const birthdayString = `${day}/${month}${year ? `/${year}` : ""}`;
      await editOriginalInteractionResponse(app.id, data.token, {
        content: interpolator(messageList.birthday.set_success, {
          user: `<@${user}>`,
          date: birthdayString,
        }),
      });

      logger.info(
        `Add user ${user} birthday to ${birthdayString} in ${data.guild_id} by ` +
          `${(data.member || data).user?.username}#${(data.member || data).user
            ?.discriminator}`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
