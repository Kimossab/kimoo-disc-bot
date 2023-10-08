import BaseModule from "#base-module";

import { getServerRoleChannel } from "@/bot/database";
import { editMessage, getEmojis, getRoles } from "@/discord/rest";
import { chunkArray, interpolator } from "@/helper/common";
import messageList from "@/helper/messages";
import {
  ActionRow,
  AvailableLocales,
  Button,
  ButtonStyle,
  ComponentType,
} from "@/types/discord";

import addCommand from "./commands/add.command";
import channelCommand from "./commands/channel.command";
import refreshCommand from "./commands/refresh.command";
import { getRoleCategoriesByServer } from "./database";

export default class RoleModule extends BaseModule {
  constructor(isActive: boolean) {
    super("role", isActive);

    if (!isActive) {
      this.logger.info("Module deactivated");
      return;
    }

    this.commandDescription[AvailableLocales.English_US] =
      "Commands related to self assigning roles";

    this.commandList = {
      channel: channelCommand(),
      add: addCommand(this.logger, (guild: string) =>
        this.updateRoleMessages(guild)
      ),
      refresh: refreshCommand((guild: string) =>
        this.updateRoleMessages(guild)
      ),
    };
  }

  private async updateRoleMessages(guild: string) {
    const categories = await getRoleCategoriesByServer(guild);
    const channel = await getServerRoleChannel(guild);

    if (!channel) {
      return;
    }

    const roles = await getRoles(guild);
    const emojis = await getEmojis(guild);

    if (!roles) {
      return;
    }

    for (const category of categories) {
      const rolesChunked = chunkArray(category.roles, 5);

      const components: ActionRow[] = rolesChunked.map((chunk) => ({
        type: ComponentType.ActionRow,
        components: chunk.map((role) => {
          const component: Button = {
            type: ComponentType.Button,
            style: ButtonStyle.Secondary,
            custom_id: `role.add.${category.category}.${role.role}`,
            label: roles.find((r) => r.id === role.role)?.name,
          };

          if (role.icon && emojis) {
            const emoji = emojis?.find((e) => e.name === role.icon);
            if (!emoji) {
              this.logger.error("Emoji not found", { role });
            } else {
              component.emoji = {
                id: emoji?.id,
                name: null,
              };
            }
          }

          return component;
        }),
      }));

      await editMessage(channel, category.message, {
        content: interpolator(messageList.roles.info.category, {
          category: category.category,
        }),
        components: components,
      });
    }
  }
}
