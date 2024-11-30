import { CommandHandler, CommandInfo } from "#base-module";
import { getBirthdaysByMonth, getUserBirthday } from "#birthday/database";

import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import { interpolator } from "@/helper/common";
import { no_mentions } from "@/helper/constants";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import { APIApplication, APIApplicationCommandOption, APIInteraction, ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";

interface GetCommandOptions {
  user: string;
  month: number;
}

const definition: APIApplicationCommandOption = {
  name: "get",
  description: "Gets someone's birthday from the database",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "user",
      description: "The user whose birthday you're getting",
      type: ApplicationCommandOptionType.User
    },
    {
      name: "month",
      description: "The users whose birthday is on a certain month",
      type: ApplicationCommandOptionType.Integer
    }
  ]
};

const handleGetMonthCommand = async (
  logger: Logger,
  data: APIInteraction,
  app: Partial<APIApplication>,
  month: number
): Promise<void> => {
  if (!data.guild_id) {
    return Promise.resolve();
  }
  await createInteractionResponse(data.id, data.token, {
    type: InteractionResponseType.DeferredChannelMessageWithSource
  });

  const bd = await getBirthdaysByMonth(data.guild_id, month);

  let message = "";

  for (const b of bd) {
    message += `<@${b.user}> - ${b.day}/${b.month}`;
    if (b.year) {
      message += `/${b.year}`;
    }

    message += "\n";
  }

  if (message === "") {
    message = interpolator(messageList.birthday.found_zero, {
      month
    });
  }

  await editOriginalInteractionResponse(app.id || "", data.token, {
    content: message,
    allowed_mentions: no_mentions
  });

  logger.info(`Birthday for month ${month} requested in ${data.guild_id} by ` +
  `${data.member?.user?.username}#${data.member?.user?.discriminator}`);
};
const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      const { user, month } = getOptions<GetCommandOptions>(
        ["user", "month"],
        option.options
      );

      if (month) {
        return handleGetMonthCommand(logger, data, app, month);
      }

      const requestedUser = user || (data.member || data).user?.id || "";

      const bd = await getUserBirthday(data.guild_id, requestedUser);

      if (bd) {
        const birthdayString = `${bd.day}/${bd.month}${
          bd.year
            ? `/${bd.year}`
            : ""
        }`;
        await editOriginalInteractionResponse(app.id, data.token, {
          content: interpolator(messageList.birthday.user, {
            user: `<@${requestedUser}>`,
            date: birthdayString
          }),
          allowed_mentions: no_mentions
        });
        logger.info(`Birthday requested in ${data.guild_id} by ${
          (data.member || data).user?.username
        }#${(data.member || data).user?.discriminator}`);
      } else {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.not_found
        });
      }
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger)
});
