import { getServerAnimeChannel, setServerAnimeChannel } from "@/bot/database";
import { editOriginalInteractionResponse } from "@/discord/rest";
import { stringReplacer } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import { CommandHandler } from "@/types/discord";

interface ChannelCommandOptions {
  channel: string;
}

export const channelCommand = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      const { channel } = getOptions<ChannelCommandOptions>(
        ["channel"],
        option.options
      );

      if (channel) {
        await setServerAnimeChannel(data.guild_id, channel);
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.anilist.channel_set_success, {
            channel: `<#${channel}>`,
          }),
        });
        logger.log(
          `Set Anime channel to ${channel} in ${data.guild_id} by ` +
            `${(data.member || data).user?.username}#${
              (data.member || data).user?.discriminator
            }`
        );
      } else {
        const ch = await getServerAnimeChannel(data.guild_id);
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.anilist.server_channel, {
            channel: `<#${ch}>`,
          }),
        });
        logger.log(
          `Get anime channel in ${data.guild_id} by ${
            (data.member || data).user?.username
          }#${(data.member || data).user?.discriminator}`
        );
      }
    }
  };
};
