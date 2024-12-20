import { CommandHandler, CommandInfo } from "#base-module";
import { getServersBirthdayInfo } from "#birthday/database";

import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "discord-api-types/v10";
import { createInteractionResponse, editOriginalInteractionResponse } from "@/discord/rest";
import { getApplication } from "@/state/store";
import { getOptions } from "@/helper/modules";
import { interpolator } from "@/helper/common";
import { setServerBirthdayChannel } from "@/database";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";

interface ChannelOption {
  channel: string;
}

const definition: APIApplicationCommandOption = {
  name: "channel",
  description: "Sets the channel where the happy birthday message is sent to",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "channel",
      description: "The channel where the happy birthday message is sent to",
      type: ApplicationCommandOptionType.Channel,
    },
  ],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, { type: InteractionResponseType.DeferredChannelMessageWithSource });

      const { channel } = getOptions<ChannelOption>(
        ["channel"],
        option.options,
      );

      if (channel) {
        await setServerBirthdayChannel(data.guild_id, channel);
        await editOriginalInteractionResponse(app.id, data.token, { content: interpolator(messageList.birthday.channel_set_success, { channel: `<#${channel}>` }) });
        logger.info(`Set birthday channel to ${channel} in ${data.guild_id} by `
          + `${(data.member || data).user?.username}#${
            (data.member || data).user?.discriminator
          }`);
      }
      else {
        const ch = await getServersBirthdayInfo();
        const { channel } = ch[data.guild_id];
        await editOriginalInteractionResponse(app.id, data.token, { content: interpolator(messageList.birthday.servers_channel, { channel: `<#${channel}>` }) });
        logger.info(`Get birthday channel in ${data.guild_id} by ${
          (data.member || data).user?.username
        }#${(data.member || data).user?.discriminator}`);
      }
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
  isAdmin: true,
});
