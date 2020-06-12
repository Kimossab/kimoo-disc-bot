import DiscordSocket from "../discord/socket";
import Helper from "../helper";
import DiscordRest from "../discord/rest";
import Weeb from "../modules/weeb";
import Birthdays from "../modules/birthdays";
import Admin from "../modules/admin";

class Commands {
  //for help
  private static cmdArray = ['help', 'mal', 'wiki', 'sauce'];
  private static adminCmdArray = ['setadminrole', 'settrigger', 'setlanguage', 'setbirthdaychannel', 'setbirthday', 'deletebirthday', 'getbirthday'];

  public static handle(messageData: discord.message) {
    if (!messageData.author.bot) {
      const socket = DiscordSocket.getInstance();
      if (!socket) {
        return;
      }

      const guildIndex = socket.guildList.findIndex(
        g => messageData.guild_id === g.id
      );
      const trigger = Helper.getTrigger(socket.guildList[guildIndex]).replace(/\./g, '\\.');
      const regex = new RegExp(trigger + "([^\\s]*)\\s?(.*)", "g");
      const regExec = regex.exec(messageData.content);

      if (regExec) {
        const splited = regExec.slice(1, 3);

        try {
          switch (splited[0]) {
            case 'help': {
              this.help(socket.guildList[guildIndex], trigger, messageData);
              break;
            }
            case 'searchmal':
            case 'mal': {
              Weeb.getInstance().searchMal(socket.guildList[guildIndex], trigger, messageData, splited);
              break;
            }
            case 'sauce': {
              Weeb.getInstance().sauceNao(socket.guildList[guildIndex], trigger, messageData, splited);
              break;
            }
            case 'wiki': {
              Weeb.getInstance().searchWiki(socket.guildList[guildIndex], trigger, messageData, splited);
              break;
            }
            case 'setbirthday':
            case 'setbday': {
              Birthdays.setBirthday(socket.guildList[guildIndex], trigger, messageData, splited);
              break;
            }
            case 'setbirthdaychannel':
            case 'setbdayc': {
              Birthdays.setBirthdayChannel(socket.guildList[guildIndex], trigger, messageData, splited);
              break;
            }
            case 'setadminrole':
            case 'sar': {
              Admin.setAdminRole(socket.guildList[guildIndex], trigger, messageData, splited);
              break;
            }
            case 'settrigger': {
              Admin.setTrigger(socket.guildList[guildIndex], trigger, messageData, splited);
              break;
            }
            case 'setlanguage':
            case 'setlang': {
              Admin.setLanguage(socket.guildList[guildIndex], trigger, messageData, splited);
              break;
            }
            case 'deletebirthday':
            case 'deletebday': {
              Birthdays.deleteBirthday(socket.guildList[guildIndex], trigger, messageData, splited);
              break;
            }
            case 'getbirthday':
            case 'getbday': {
              Birthdays.getBirthday(socket.guildList[guildIndex], trigger, messageData, splited);
              break;
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  private static help(guild: discord.guild, trigger: string, messageData: discord.message) {
    const socket = DiscordSocket.getInstance();
    if (!socket) {
      return;
    }

    let embed: discord.embed = {
      title: Helper.translation(guild, "general.help"),
      color: 8995572,
      fields: []
    };

    for (let c of Commands.cmdArray) {
      embed.fields!.push({
        name: Helper.translation(guild, `help.${c}.command`, {
          trigger: trigger
        }),
        value: Helper.translation(guild, `help.${c}.description`)
      });
    }

    if (Admin.checkAdmin(guild, messageData.author.id)) {
      for (let c of Commands.adminCmdArray) {
        embed.fields!.push({
          name: Helper.translation(guild, `help.${c}.command`, {
            trigger: trigger
          }),
          value: Helper.translation(guild, `help.${c}.description`)
        });
      }
    }

    DiscordRest.sendMessage(messageData.channel_id, null, embed);
  }

}

export default Commands;
