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

  public static sendMessage(
    channel: string,
    content: string | null,
    embed: discord.embed | null = null,
    tts: boolean = false
  ) {
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
      // console.log(r);
    });
  }


  public static sendInfo(
    channel: string,
    server: discord.guild,
    command: string,
    trigger: string
  ) {
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
}

export default DiscordRest;