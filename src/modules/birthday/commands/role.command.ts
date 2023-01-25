import { CommandInfo } from "#base-module";

import { getServerBirthdayRole, setServerBirthdayRole } from "@/bot/database";
import { editOriginalInteractionResponse } from "@/discord/rest";
import { stringReplacer } from "@/helper/common";
import { no_mentions } from "@/helper/constants";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

interface RoleCommandOptions {
  role: string;
}

const definition: ApplicationCommandOption = {
  name: "role",
  description: "Sets the role to give to users on their birthday",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "role",
      description: "The role to give to users on their birthday",
      type: ApplicationCommandOptionType.ROLE,
    },
  ],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      const { role } = getOptions<RoleCommandOptions>(["role"], option.options);

      if (role) {
        await setServerBirthdayRole(data.guild_id, role);
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.birthday.set_role, {
            role: `<@&${role}>`,
          }),
          allowed_mentions: no_mentions,
        });
        logger.log(
          `Set birthday role ${role} in ${data.guild_id} by ${
            (data.member || data).user?.username
          }#${(data.member || data).user?.discriminator}`
        );
      } else {
        const role = await getServerBirthdayRole(data.guild_id);
        if (role) {
          await editOriginalInteractionResponse(app.id, data.token, {
            content: stringReplacer(messageList.birthday.server_role, {
              role: `<@&${role}>`,
            }),
            allowed_mentions: no_mentions,
          });
        } else {
          await editOriginalInteractionResponse(app.id, data.token, {
            content: messageList.birthday.role_not_found,
            allowed_mentions: no_mentions,
          });
        }
        logger.log(
          `Get birthday role in ${data.guild_id} by ${
            (data.member || data).user?.username
          }#${(data.member || data).user?.discriminator}`
        );
      }
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
