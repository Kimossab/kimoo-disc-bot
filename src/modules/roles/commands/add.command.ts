import { CommandHandler, CommandInfo, ComponentCommandHandler } from "#base-module";
import { addRole, addRoleCategory, getRoleCategory } from "#roles/database";

import { getServer } from "@/database";
import {
  createInteractionResponse,
  editOriginalInteractionResponse,
  getEmojis,
  getGuildMember,
  getRoles,
  giveRole,
  removeRole,
  sendMessage
} from "@/discord/rest";
import { ApplicationCommandSubcommandOption, Emoji } from "@/discord/rest/types.gen";
import { interpolator } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import { ApplicationCommandOptionType, InteractionResponseType, MessageFlags } from "discord-api-types/v10";

interface CommandOptions {
  category: string;
  role: string;
  icon: string | null;
}

const definition: ApplicationCommandSubcommandOption = {
  name: "add",
  description: messageList.roles.add.description,
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "role",
      description: messageList.roles.add.role,
      type: ApplicationCommandOptionType.Role,
      required: true
    },
    {
      name: "category",
      description: messageList.roles.add.category,
      type: ApplicationCommandOptionType.String
    },
    {
      name: "icon",
      description: messageList.roles.add.icon,
      type: ApplicationCommandOptionType.String
    }
  ]
};

const handler = (
  logger: Logger,
  updateRoleMessages: (server: string) => Promise<void>
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id && data.guild_id) {
      const channel = (await getServer(data.guild_id))?.roleChannel;

      if (!channel) {
        await createInteractionResponse(data.id, data.token, {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: messageList.roles.errors.no_channel,
            flags: MessageFlags.Ephemeral
          }
        });
        return;
      }

      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
        data: {
          flags: MessageFlags.Ephemeral
        }
      });

      const { role, category, icon } = getOptions<CommandOptions>(
        ["role", "category", "icon"],
        option.options
      );

      const roleCat = category ?? "Default";

      const catData = await getRoleCategory(data.guild_id, roleCat);

      if (catData && catData.roles.length >= 25) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: interpolator(messageList.roles.errors.too_many_roles, {
            category: roleCat
          })
        });
        return;
      }

      if (!catData) {
        const message = await sendMessage(
          channel,
          interpolator(messageList.roles.info.category, { category: roleCat })
        );
        if (!message) {
          logger.error("Failed to create message.");
          return;
        }

        await addRoleCategory(data.guild_id, roleCat, message?.id);
      } else if (catData.roles.find((r) => r.id === role)) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.roles.errors.duplicate
        });
        return;
      }

      let emoji: Emoji | undefined;

      if (icon) {
        const emojis = await getEmojis(data.guild_id);
        emoji = emojis?.find((e) => e.name === icon);
      }

      await addRole(data.guild_id, roleCat, role, emoji
        ? icon
        : null);
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.roles.add.success
      });

      await updateRoleMessages(data.guild_id);
    }
  };
};

const componentHandler = (
  logger: Logger,
  updateRoleMessages: (server: string) => Promise<void>
): ComponentCommandHandler => {
  return async (data, subCmd) => {
    if (!data.guild_id || !data.member?.user) {
      return;
    }

    const sendResponse = async (msg: string, updateRoles: boolean = false) => {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          flags: MessageFlags.Ephemeral,
          content: msg
        }
      });

      if (updateRoles) {
        await updateRoleMessages(data.guild_id!);
      }
    };

    const category = await getRoleCategory(data.guild_id, subCmd[0]);
    const catRole = category?.roles.find((r) => r.id === subCmd[1]);
    if (!catRole) {
      await sendResponse(messageList.roles.errors.failure, true);
      logger.error("Category or role doesn't exist on the DB");
      return;
    }

    const serverRoles = await getRoles(data.guild_id);
    const role = serverRoles?.find((r) => r.id === catRole.id);
    if (!role) {
      await sendResponse(messageList.roles.errors.failure, true);
      logger.error("Role doesn't exist on the server");
      return;
    }

    const member = await getGuildMember(data.guild_id, data.member.user.id);

    if (member?.roles.find((r) => r === role.id)) {
      await removeRole(data.guild_id, data.member.user.id, role.id);

      await sendResponse(interpolator(messageList.roles.add.removed, {
        role: role.name
      }));
    } else {
      await giveRole(data.guild_id, data.member.user.id, role.id);

      await sendResponse(interpolator(messageList.roles.add.given, {
        role: role.name
      }));
    }
  };
};
export default (
  logger: Logger,
  updateRoleMessages: (server: string) => Promise<void>
): CommandInfo => ({
  definition,
  handler: handler(logger, updateRoleMessages),
  componentHandler: componentHandler(logger, updateRoleMessages),
  isAdmin: true
});
