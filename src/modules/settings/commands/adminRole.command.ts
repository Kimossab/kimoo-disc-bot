import { CommandInfo } from "#base-module";

import { getServer, setAdminRole } from "@/database";
import { createInteractionResponse } from "@/discord/rest";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackType,
} from "@/types/discord";

const definition: ApplicationCommandOption = {
  name: "admin_role",
  description: "Gets or sets the admin role",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "role",
      description: "Role you want to set as admin",
      type: ApplicationCommandOptionType.ROLE,
    },
  ],
};

const handler = (): CommandHandler => {
  return async (data, option) => {
    if (!data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Only allowed in a guild`,
        },
      });
      return;
    }

    const role = option.options?.length ? option.options[0] : null;

    if (role) {
      await setAdminRole(data.guild_id, role.value as string);
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Admin role set to <@&${role.value}>`,
          allowed_mentions: {
            parse: [],
            roles: [],
            users: [],
            replied_user: false,
          },
        },
      });
    } else {
      const role = (await getServer(data.guild_id))?.adminRole;
      if (role) {
        await createInteractionResponse(data.id, data.token, {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Admin role is <@&${role}>`,
            allowed_mentions: {
              parse: [],
              roles: [],
              users: [],
              replied_user: false,
            },
          },
        });
      } else {
        await createInteractionResponse(data.id, data.token, {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "This server doesn't have an admin role defined",
          },
        });
      }
    }
  };
};

export default (): CommandInfo => ({
  definition,
  handler: handler(),
  isAdmin: true,
});
