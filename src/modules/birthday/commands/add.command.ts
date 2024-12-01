import { CommandHandler, CommandInfo } from "#base-module";
import { addBirthday, getUserBirthday } from "#birthday/database";

import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "discord-api-types/v10";
import { createInteractionResponse, editOriginalInteractionResponse } from "@/discord/rest";
import { getApplication } from "@/state/store";
import { getOptions } from "@/helper/modules";
import { interpolator } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";

interface AddCommandOptions {
  day: number;
  month: number;
  year: number;
}

const definition: APIApplicationCommandOption = {
  name: "add",
  description: "Adds your birthday to the database",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "day",
      description: "The day when you were born",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: "month",
      description: "The month when you were born",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: "year",
      description: "The year when they were born",
      type: ApplicationCommandOptionType.Integer,
    },
  ],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, { type: InteractionResponseType.DeferredChannelMessageWithSource });

      const {
        day, month, year,
      } = getOptions<AddCommandOptions>(
        ["day", "month", "year"],
        option.options,
      );

      const user = (data.member || data).user?.id || "";

      const bd = await getUserBirthday(data.guild_id, user);

      if (bd) {
        await editOriginalInteractionResponse(app.id, data.token, { content: messageList.birthday.already_set });
        return;
      }

      await addBirthday(data.guild_id, user, day || -1, month || -1, year);

      const birthdayString = `${day}/${month}${year
        ? `/${year}`
        : ""}`;
      await editOriginalInteractionResponse(app.id, data.token, {
        content: interpolator(messageList.birthday.set_success, {
          user: `<@${user}>`,
          date: birthdayString,
        }),
      });

      logger.info(`Add user ${user} birthday to ${birthdayString} in ${data.guild_id} by `
        + `${(data.member || data).user?.username}#${
          (data.member || data).user?.discriminator
        }`);
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
