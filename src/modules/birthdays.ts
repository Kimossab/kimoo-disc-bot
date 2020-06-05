import DiscordSocket from "../discord/socket";
import Helper from "../helper";
import DiscordRest from "../discord/rest";
import DB from "../database";
import Admin from "./admin";

class Birthdays {
  private static _instance: Birthdays;
  /**
   * Singleton
   */
  public static getInstance() {
    if (!Birthdays._instance) {
      Birthdays._instance = new Birthdays();
    }

    return Birthdays._instance;
  }

  constructor() {
    setInterval(this.minuteTick, 1 * 60 * 1000);
  }

  private minuteTick() {
    const socket = DiscordSocket.getInstance();
    if (!socket) {
      return;
    }

    const date = new Date();
    const currentTime = date.getHours() * 60 + date.getMinutes();

    for (const guild of socket.guildList) {
      if (guild.birthday_settings && guild.birthday_settings.hours === currentTime) {
        const birthdays: database.birthday[] = [];

        for (const birthday of guild.birthdays) {
          if (birthday.day === date.getDay() && birthday.month === date.getMonth() + 1) {
            birthdays.push(birthday);
          }
        }

        if (birthdays.length > 0) {
          let message = Helper.translation(guild, "birthdays.message");

          for (const birthday of birthdays) {
            // const age = birthday.year ? date.getFullYear() - birthday.year : null;
            message += ` <@${birthday.user_id}>`;
          }

          DiscordRest.sendMessage(guild.birthday_settings.channel, message);
        }
      }
    }
  }

  public setBirthday(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    try {
      if (!Admin.checkAdmin(guild, messageData.author.id)) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.permission" });
      }

      const regex = /(?<user>[^\s]*)\s(?<day>\d{1,2})\s(?<month>\d{1,2})(\s(?<year>\d{4}))?/;
      const result = regex.exec(data[1]);

      if (!result?.groups || !result?.groups.user || !result?.groups.day || !result?.groups.month) {
        return DiscordRest.sendInfo(messageData.channel_id, guild, "setbirthday", trigger);
      }

      const regexUser = /^((<@!(?<id>\d*)>)|(?<name>.*))/;
      const resultUser = regexUser.exec(result.groups.user);

      if (!resultUser?.groups || (!resultUser?.groups.id && !resultUser?.groups.name)) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "no_user_found" });
      }

      const userInpt = resultUser.groups.id ? resultUser.groups.id : resultUser.groups.name.toLowerCase();

      const user_id = Helper.findUser(guild, userInpt);

      if (!user_id) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.no_user_found" });
      }

      DB.getInstance().insertOrUpdateBirthday(guild, {
        user_id: user_id,
        day: Number(result.groups.day),
        month: Number(result.groups.month),
        year: result.groups.year ? Number(result.groups.year) : null,
      });

      const translation = Helper.translation(guild, "success.setbirthday");

      DiscordRest.sendMessage(messageData.channel_id, translation);

    } catch (e) {
      console.error("setBirthday", e);
    }
  }

  public static async setBirthdayChannel(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    try {
      if (!Admin.checkAdmin(guild, messageData.author.id)) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.permission" });
      }

      const regex = /^((<#(?<id>\d*)>)|(?<name>.*))/;
      const result = regex.exec(data[1]);

      if (!result?.groups || (!result?.groups.id && !result?.groups.name)) {
        return DiscordRest.sendInfo(messageData.channel_id, guild, "setbirthdaychannel", trigger);
      }

      const channelName = result.groups.id ? result.groups.id : result.groups.name.toLowerCase();

      const channel = guild.channels?.find(c => c.id === channelName || c.name?.toLowerCase() === channelName);

      if (!channel) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.no_channel_found" });
      }

      const socket = DiscordSocket.getInstance();
      if (!socket) {
        return;
      }

      const index = socket.guildList.findIndex(g => g.id === guild.id);

      if (index < 0) {
        return;
      }

      socket.guildList[index].birthday_settings = await DB.getInstance().upsertBirthdaySettings(guild.id, channel.id, socket.guildList[index].birthday_settings?.hours);

      const translation = Helper.translation(guild, "success.setbirthdaychannel", { 'channel': `<#${channel.id}>` });
      DiscordRest.sendMessage(messageData.channel_id, translation);

    } catch (e) {
      console.error("setBirthday", e);
    }
  }
}

export default Birthdays