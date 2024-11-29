import { CommandHandler, CommandInfo } from "#base-module";
import { getServersBirthdayInfo } from "#birthday/database";

import { setServerBirthdayChannel } from "@/database";
import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import { ApplicationCommandSubcommandOption } from "@/discord/rest/types.gen";
import { interpolator } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import { ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";

interface ChannelOption {
  channel: string;
}

const definition: ApplicationCommandSubcommandOption = {
  name: "channel",
  description: "Sets the channel where the happy birthday message is sent to",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "channel",
      description: "The channel where the happy birthday message is sent to",
      type: ApplicationCommandOptionType.Channel
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

      const { channel } = getOptions<ChannelOption>(
        ["channel"],
        option.options
      );

      if (channel) {
        await setServerBirthdayChannel(data.guild_id, channel);
        await editOriginalInteractionResponse(app.id, data.token, {
          content: interpolator(messageList.birthday.channel_set_success, {
            channel: `<#${channel}>`
          })
        });
        logger.info(`Set birthday channel to ${channel} in ${data.guild_id} by ` +
        `${(data.member || data).user?.username}#${
          (data.member || data).user?.discriminator
        }`);
      } else {
        const ch = await getServersBirthdayInfo();
        const { channel } = ch[data.guild_id];
        await editOriginalInteractionResponse(app.id, data.token, {
          content: interpolator(messageList.birthday.servers_channel, {
            channel: `<#${channel}>`
          })
        });
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
  isAdmin: true
});
