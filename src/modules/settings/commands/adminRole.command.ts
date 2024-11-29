import { CommandHandler, CommandInfo } from "#base-module";

import { getServer, setAdminRole } from "@/database";
import { createInteractionResponse } from "@/discord/rest";
import { ApplicationCommandSubcommandOption } from "@/discord/rest/types.gen";
import { APIApplicationCommandInteractionDataRoleOption, APIApplicationCommandInteractionDataSubcommandOption, ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";

const definition: ApplicationCommandSubcommandOption = {
  name: "admin_role",
  description: "Gets or sets the admin role",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "role",
      description: "Role you want to set as admin",
      type: ApplicationCommandOptionType.Role
    }
  ]
};

const handler = (): CommandHandler => {
  return async (data, option) => {
    const subCommandOption = option as APIApplicationCommandInteractionDataSubcommandOption;
    if (!data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "Only allowed in a guild"
        }
      });
      return;
    }

    const role = subCommandOption.options?.length
      ? subCommandOption.options[0] as APIApplicationCommandInteractionDataRoleOption
      : null;

    if (role) {
      await setAdminRole(data.guild_id, role.value as string);
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `Admin role set to <@&${role.value}>`,
          allowed_mentions: {
            parse: [],
            roles: [],
            users: [],
            replied_user: false
          }
        }
      });
    } else {
      const role = (await getServer(data.guild_id))?.adminRole;
      if (role) {
        await createInteractionResponse(data.id, data.token, {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: `Admin role is <@&${role}>`,
            allowed_mentions: {
              parse: [],
              roles: [],
              users: [],
              replied_user: false
            }
          }
        });
      } else {
        await createInteractionResponse(data.id, data.token, {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: "This server doesn't have an admin role defined"
          }
        });
      }
    }
  };
};

export default (): CommandInfo => ({
  definition,
  handler: handler(),
  isAdmin: true
});
