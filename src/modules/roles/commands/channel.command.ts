import { CommandInfo } from "#base-module";

import { getServerRoleChannel, setServerRoleChannel } from "@/bot/database";
import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { interpolator } from "@/helper/common";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackDataFlags,
  InteractionCallbackType,
} from "@/types/discord";

interface ChannelCommandOptions {
  channel: string;
}

const definition: ApplicationCommandOption = {
  name: "channel",
  description: messageList.roles.channel.description,
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "channel",
      description: messageList.roles.channel.option,
      type: ApplicationCommandOptionType.CHANNEL,
    },
  ],
};

const handler = (): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });

      const { channel } = getOptions<ChannelCommandOptions>(
        ["channel"],
        option.options
      );

      if (channel) {
        await setServerRoleChannel(data.guild_id, channel);
        await editOriginalInteractionResponse(app.id, data.token, {
          content: interpolator(messageList.roles.channel.set_success, {
            channel: `<#${channel}>`,
          }),
        });
      } else {
        const ch = await getServerRoleChannel(data.guild_id);
        if (!ch) {
          await editOriginalInteractionResponse(app.id, data.token, {
            content: messageList.roles.errors.no_channel,
          });
          return;
        }
        await editOriginalInteractionResponse(app.id, data.token, {
          content: interpolator(messageList.roles.channel.get, {
            channel: `<#${ch}>`,
          }),
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
