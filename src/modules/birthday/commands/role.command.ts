import { CommandHandler, CommandInfo } from "#base-module";

import { getServer, setServerBirthdayRole } from "@/database";
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
import { APIApplicationCommandOption, ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";

interface RoleCommandOptions {
  role: string;
}

const definition: APIApplicationCommandOption = {
  name: "role",
  description: "Sets the role to give to users on their birthday",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "role",
      description: "The role to give to users on their birthday",
      type: ApplicationCommandOptionType.Role
    }
  ]
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource
      });

      const { role } = getOptions<RoleCommandOptions>(["role"], option.options);

      if (role) {
        await setServerBirthdayRole(data.guild_id, role);
        await editOriginalInteractionResponse(app.id, data.token, {
          content: interpolator(messageList.birthday.set_role, {
            role: `<@&${role}>`
          }),
          allowed_mentions: no_mentions
        });
        logger.info(`Set birthday role ${role} in ${data.guild_id} by ${
          (data.member || data).user?.username
        }#${(data.member || data).user?.discriminator}`);
      } else {
        const role = (await getServer(data.guild_id))?.birthdayRole;
        if (role) {
          await editOriginalInteractionResponse(app.id, data.token, {
            content: interpolator(messageList.birthday.server_role, {
              role: `<@&${role}>`
            }),
            allowed_mentions: no_mentions
          });
        } else {
          await editOriginalInteractionResponse(app.id, data.token, {
            content: messageList.birthday.role_not_found,
            allowed_mentions: no_mentions
          });
        }
        logger.info(`Get birthday role in ${data.guild_id} by ${
          (data.member || data).user?.username
        }#${(data.member || data).user?.discriminator}`);
      }
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger)
});
