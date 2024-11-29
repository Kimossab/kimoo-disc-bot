import { CommandHandler, CommandInfo } from "#base-module";

import { getServer, setServerAnimeChannel } from "@/database";
import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import { ApplicationCommandSubcommandOption } from "@/discord/rest/types.gen";
import { interpolator } from "@/helper/common";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import { ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";

interface ChannelCommandOptions {
  channel: string;
}

const definition: ApplicationCommandSubcommandOption = {
  name: "channel",
  description:
    "Sets the channel where the anime notification messages are sent to",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "channel",
      description:
        "The channel where the anime notification messages are sent to",
      type: ApplicationCommandOptionType.Channel
    }
  ]
};

const handler = (): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource
      });

      const { channel } = getOptions<ChannelCommandOptions>(
        ["channel"],
        option.options
      );

      if (channel) {
        await setServerAnimeChannel(data.guild_id, channel);
        await editOriginalInteractionResponse(app.id, data.token, {
          content: interpolator(messageList.anilist.channel_set_success, {
            channel: `<#${channel}>`
          })
        });
      } else {
        const ch = (await getServer(data.guild_id))?.animeChannel;
        await editOriginalInteractionResponse(app.id, data.token, {
          content: interpolator(messageList.anilist.server_channel, {
            channel: `<#${ch}>`
          })
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
