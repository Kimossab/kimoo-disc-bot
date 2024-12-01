import { CommandHandler, CommandInfo } from "#base-module";

import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  InteractionResponseType,
  MessageFlags,
} from "discord-api-types/v10";
import { createInteractionResponse, editOriginalInteractionResponse } from "@/discord/rest";
import { getApplication } from "@/state/store";
import { getOptions } from "@/helper/modules";
import { getServer, setServerRoleChannel } from "@/database";
import { interpolator } from "@/helper/common";
import messageList from "@/helper/messages";

interface ChannelCommandOptions {
  channel: string;
}

const definition: APIApplicationCommandOption = {
  name: "channel",
  description: messageList.roles.channel.description,
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "channel",
      description: messageList.roles.channel.option,
      type: ApplicationCommandOptionType.Channel,
    },
  ],
};

const handler = (): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
        data: { flags: MessageFlags.Ephemeral },
      });

      const { channel } = getOptions<ChannelCommandOptions>(
        ["channel"],
        option.options,
      );

      if (channel) {
        await setServerRoleChannel(data.guild_id, channel);
        await editOriginalInteractionResponse(app.id, data.token, { content: interpolator(messageList.roles.channel.set_success, { channel: `<#${channel}>` }) });
      }
      else {
        const ch = (await getServer(data.guild_id))?.roleChannel;
        if (!ch) {
          await editOriginalInteractionResponse(app.id, data.token, { content: messageList.roles.errors.no_channel });
          return;
        }
        await editOriginalInteractionResponse(app.id, data.token, { content: interpolator(messageList.roles.channel.get, { channel: `<#${ch}>` }) });
      }
    }
  };
};

export default (): CommandInfo => ({
  definition,
  handler: handler(),
  isAdmin: true,
});
