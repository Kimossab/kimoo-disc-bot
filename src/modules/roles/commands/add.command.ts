import { CommandInfo } from "#base-module";
import { addRole, addRoleCategory, getRoleCategory } from "#roles/database";

import { getServerRoleChannel } from "@/bot/database";
import {
  createInteractionResponse,
  editOriginalInteractionResponse,
  getEmojis,
  getRoles,
  giveRole,
  sendMessage,
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
  ComponentCommandHandler,
  InteractionCallbackDataFlags,
  InteractionCallbackType,
} from "@/types/discord";

interface CommandOptions {
  category: string;
  role: string;
  icon: string | null;
}

const definition: ApplicationCommandOption = {
  name: "add",
  description: messageList.roles.add.description,
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "role",
      description: messageList.roles.add.role,
      type: ApplicationCommandOptionType.ROLE,
      required: true,
    },
    {
      name: "category",
      description: messageList.roles.add.category,
      type: ApplicationCommandOptionType.STRING,
    },
    {
      name: "icon",
      description: messageList.roles.add.icon,
      type: ApplicationCommandOptionType.STRING,
    },
  ],
};

const handler = (
  logger: Logger,
  updateRoleMessages: (server: string) => Promise<void>
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id && data.guild_id) {
      const channel = await getServerRoleChannel(data.guild_id);

      if (!channel) {
        await createInteractionResponse(data.id, data.token, {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: messageList.roles.errors.no_channel,
            flags: InteractionCallbackDataFlags.EPHEMERAL,
          },
        });
        return;
      }

      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
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
            category: roleCat,
          }),
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
      } else if (catData.roles.find((r) => r.role === role)) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.roles.errors.duplicate,
        });
        return;
      }

      let emoji: string | null = null;

      if (icon) {
        const emojis = await getEmojis(data.guild_id);
        emoji = emojis?.find((e) => e.name === icon)?.id ?? null;
      }

      await addRole(data.guild_id, roleCat, role, emoji);
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.roles.add.success,
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

    const category = await getRoleCategory(data.guild_id!, subCmd[0]);
    if (!category) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionCallbackDataFlags.EPHEMERAL,
          content: messageList.roles.errors.failure,
        },
      });
      logger.error("Category doesn't exist on the DB");
      await updateRoleMessages(data.guild_id);
      return;
    }

    const catRole = category.roles.find((r) => r.role === subCmd[1]);
    if (!catRole) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionCallbackDataFlags.EPHEMERAL,
          content: messageList.roles.errors.failure,
        },
      });
      logger.error("Role doesn't exist on the DB");
      await updateRoleMessages(data.guild_id);
      return;
    }

    const serverRoles = await getRoles(data.guild_id);
    const role = serverRoles?.find((r) => r.id === catRole.role);
    if (!role) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionCallbackDataFlags.EPHEMERAL,
          content: messageList.roles.errors.failure,
        },
      });
      logger.error("Role doesn't exist on the server");
      await updateRoleMessages(data.guild_id);
      return;
    }

    await giveRole(data.guild_id, data.member.user.id, role.id);

    await createInteractionResponse(data.id, data.token, {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionCallbackDataFlags.EPHEMERAL,
        content: interpolator(messageList.roles.add.given, { role: role.name }),
      },
    });
  };
};
export default (
  logger: Logger,
  updateRoleMessages: (server: string) => Promise<void>
): CommandInfo => ({
  definition,
  handler: handler(logger, updateRoleMessages),
  componentHandler: componentHandler(logger, updateRoleMessages),
  isAdmin: true,
});
