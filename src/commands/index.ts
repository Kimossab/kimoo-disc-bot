import DiscordSocket from "../discord/socket";
import Helper from "../helper";
import DiscordRest from "../discord/rest";
import Weeb from "../modules/weeb";

class Commands {
  private static cmdArray = ['help', 'getanime', 'searchmal'];

  private socket: DiscordSocket;
  private weeb: Weeb;

  constructor(_socket: DiscordSocket, _weeb: Weeb) {
    this.socket = _socket;
    this.weeb = _weeb
  }

  public handle(messageData: discord.message) {
    if (!messageData.author.bot) {
      const guildIndex = this.socket.guildList.findIndex(
        g => messageData.guild_id === g.id
      );
      const trigger = process.env.DEFAULT_CMD_TRIGGER!;
      const regex = new RegExp("\\" + trigger + "([^\\s]*)\\s?(.*)", "g");
      const regExec = regex.exec(messageData.content);

      if (regExec) {
        const splited = regExec.slice(1, 3);

        try {
          switch (splited[0]) {
            case 'help': {
              this.help(guildIndex, trigger, messageData);
              break;
            }
            case 'searchmal':
            case 'mal': {
              this.weeb.searchMal(this.socket.guildList[guildIndex], trigger, messageData, splited);
              break;
            }
            // case 'getanime':
            // case 'anime': {
            //   this.weeb.getAnime(this.socket.guildList[guildIndex], trigger, messageData, splited);
            //   break;
            // }
            case 'wiki': {
              this.weeb.searchWiki(this.socket.guildList[guildIndex], trigger, messageData, splited);
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  private help(guildIndex: number, trigger: string, messageData: discord.message) {
    let embed: discord.embed = {
      title: Helper.translation(this.socket.guildList[guildIndex], "general.help"),
      color: 8995572,
      fields: []
    };

    for (let c of Commands.cmdArray) {
      embed.fields!.push({
        name: Helper.translation(this.socket.guildList[guildIndex], `help.${c}.command`, {
          trigger: trigger
        }),
        value: Helper.translation(this.socket.guildList[guildIndex], `help.${c}.description`)
      });
    }

    DiscordRest.sendMessage(messageData.channel_id, null, embed);
  }
}

export default Commands;
