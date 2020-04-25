import unirest from "unirest";
import Helper, * as helper from "../helper";

/**
 * Static class for Discord Rest communications
 */
class DiscordRest {
  /**
   * Gets the gateway bot information
   */
  public static getGatewayBot(): Promise<discord.gateway.bot> {
    return new Promise((resolve, reject) => {
      unirest
        .get(`https://${process.env.DISCORD_DOMAIN}/api/v${process.env.API_V}/gateway/bot`)
        .headers({
          authorization: `Bot ${process.env.TOKEN}`
        })
        .end((response: any) => {
          if (response.body.code === 0) {
            reject(response.body);
          }

          resolve(response.body);
        });
    });
  }

  /**
   * Sends a new message to a channel.  
   * ***
   * @param channel Channel id to send message to
   * @param content Message text to send
   * @param embed Embed information to add
   * @param tts Text To Speech
   */
  public static sendMessage(channel: string, content: string | null, embed: discord.embed | null = null, tts: boolean = false): Promise<discord.message> {
    return new Promise((resolve, reject) => {
      const req = unirest
        .post(`https://${process.env.DISCORD_DOMAIN}/api/v${process.env.API_V}/channels/${channel}/messages`)
        .headers({
          "Content-Type": "multipart/form-data",
          authorization: `Bot ${process.env.TOKEN}`
        });

      const message = {
        content: content,
        embed: embed,
        tts: tts
      };

      req.field("payload_json", JSON.stringify(message));

      // if (file) {
      //   req.attach("file", `${root}custom_files/${file}`);
      // }

      req.end((r: any) => {
        resolve(r.body);
      });
    });
  }

  /**
   * Edits an existing message.  
   * ***
   * @param message Message ID to edit
   * @param channel Channel ID of the message
   * @param content New message content
   * @param embed New Embed content
   */
  public static editMessage(message: string, channel: string, content: string | null, embed: discord.embed) {
    return new Promise((resolve, reject) => {
      const req = unirest
        .patch(`https://${process.env.DISCORD_DOMAIN}/api/v${process.env.API_V}/channels/${channel}/messages/${message}`)
        .headers({
          "Content-Type": "application/json",
          authorization: `Bot ${process.env.TOKEN}`
        });

      req.send({
        content,
        embed
      });

      req.end((r: any) => {
        resolve(r.body);
      });
    });
  }

  /**
   * Helper function to send the information of a command from translation object.  
   * ***
   * @param channel Channel ID to send the message to
   * @param server Server ID to get the correct language
   * @param command Command that needs to be sent
   * @param trigger Server's trigger for messages
   */
  public static sendInfo(channel: string, server: discord.guild, command: string, trigger: string) {
    const embed = {
      title: Helper.translation(server, "general.help.usage"),
      color: 8995572,
      fields: [
        {
          name: Helper.translation(server, `help.${command}.command`, {
            trigger: trigger
          }),
          value: Helper.translation(server, `help.${command}.description`)
        },
        {
          name: Helper.translation(server, "general.parameters"),
          value: Helper.translation(server, `help.${command}.parameters`)
        }
      ]
    };

    DiscordRest.sendMessage(channel, "", embed);
  }

  /**
   * Helper function to send an error message.  
   * ***
   * @param channel Channel ID to send the message to
   * @param server Server ID to get the correct language
   * @param message Error message
   */
  public static sendError(channel: string, server: discord.guild, message: message_translate) {
    // const guild = store.guildList.find(g => g.id === server);
    const embed = {
      title: Helper.translation(server, "general.error"),
      description: Helper.translation(server, message.key, message.replaces),
      color: 11143192
    };

    DiscordRest.sendMessage(channel, null, embed);
  }

  /**
   * Adds a reaction to a message.
   * ***
   * @param channel Channel ID of the message
   * @param message Message ID to react to
   * @param reaction Reaction name
   */
  public static addReaction(channel: string, message: string, reaction: string) {
    return new Promise((resolve, reject) => {
      const req = unirest
        .put(`https://${process.env.DISCORD_DOMAIN}/api/v${process.env.API_V}/channels/${channel}/messages/${message}/reactions/${encodeURIComponent(reaction)}/@me`)
        .headers({
          authorization: `Bot ${process.env.TOKEN}`
        });

      req.end((r: any) => {
        resolve(r.body);
      });
    });
  }
}

export default DiscordRest;