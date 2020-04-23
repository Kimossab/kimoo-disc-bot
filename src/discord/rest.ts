import unirest from "unirest";
import Helper, * as helper from "../helper";

class DiscordRest {
  static getGatewayBot(): Promise<discord.gateway.bot> {
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

  public static sendError(channel: string, guild: discord.guild, message: message_translate) {
    // const guild = store.guildList.find(g => g.id === server);
    const embed = {
      title: Helper.translation(guild, "general.error"),
      description: Helper.translation(guild, message.key, message.replaces),
      color: 11143192
    };

    DiscordRest.sendMessage(channel, null, embed);
  }

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