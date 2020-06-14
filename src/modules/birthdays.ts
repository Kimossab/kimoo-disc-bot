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
    this.minuteTick();
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
        const serverBDay = Helper.snowflakeToDate(guild.id);

        if (serverBDay.getDate() === date.getDate() && serverBDay.getMonth() === date.getMonth()) {
          const age = date.getFullYear() - serverBDay.getFullYear();
          const message = Helper.translation(guild, age > 1 ? "birthdays.server_multiple" : "birthdays.server", { age: age.toString(), name: guild.name });
          DiscordRest.sendMessage(guild.birthday_settings.channel, message);
        }

        const birthdays: database.birthday[] = [];

        for (const birthday of guild.birthdays) {
          if (birthday.day === date.getDate() && birthday.month === date.getMonth() + 1) {
            birthdays.push(birthday);
          }
        }

        console.log('<ServerBirthdays>', guild, birthdays);
        if (birthdays.length > 0) {
          let message = Helper.translation(guild, birthdays.length > 1 ? "birthdays.message_multiple" : "birthdays.message");

          for (const birthday of birthdays) {
            // const age = birthday.year ? date.getFullYear() - birthday.year : null;
            message += `\n- <@${birthday.user_id}>`;
            if (birthday.year) {
              const age = date.getFullYear() - birthday.year;
              message += ` (${age} anos)`;
            }
          }

          DiscordRest.sendMessage(guild.birthday_settings.channel, message);
        }
      }
    }
  }

  public static setBirthday(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
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
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.no_user_found" });
      }

      const userInpt = resultUser.groups.id ? resultUser.groups.id : resultUser.groups.name.toLowerCase();

      const user = Helper.findUser(guild, userInpt);

      if (!user) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.no_user_found" });
      }

      DB.getInstance().insertOrUpdateBirthday(guild, {
        user_id: user.id,
        day: Number(result.groups.day),
        month: Number(result.groups.month),
        year: result.groups.year ? Number(result.groups.year) : null,
      });

      const translation = Helper.translation(guild, "success.setbirthday", { user: user.username + '#' + user.discriminator });

      DiscordRest.sendMessage(messageData.channel_id, translation);

    } catch (e) {
      console.error("setBirthday", e);
    }
  }

  public static deleteBirthday(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    try {
      if (!Admin.checkAdmin(guild, messageData.author.id)) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.permission" });
      }

      const regex = /(?<user>[^\s]*)/;
      const result = regex.exec(data[1]);
      if (!result?.groups || !result?.groups.user) {
        return DiscordRest.sendInfo(messageData.channel_id, guild, "deletebirthday", trigger);
      }

      const regexUser = /^((<@!(?<id>\d*)>)|(?<name>.*))/;
      const resultUser = regexUser.exec(result.groups.user);

      if (!resultUser?.groups || (!resultUser?.groups.id && !resultUser?.groups.name)) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.no_user_found" });
      }

      const userInpt = resultUser.groups.id ? resultUser.groups.id : resultUser.groups.name.toLowerCase();

      const user = Helper.findUser(guild, userInpt);

      if (!user) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.no_user_found" });
      }

      DB.getInstance().deleteBirthday(guild.id, user.id);
      const translation = Helper.translation(guild, "success.deletebirthday", { user: user.username + '#' + user.discriminator });

      DiscordRest.sendMessage(messageData.channel_id, translation);
    } catch (e) {
      console.error("deleteBirthday", e);
    }
  }

  public static async getBirthday(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    try {
      if (!Admin.checkAdmin(guild, messageData.author.id)) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.permission" });
      }

      const regex = /(?<user>[^\s]*)/;
      const result = regex.exec(data[1]);
      if (!result?.groups || !result?.groups.user) {
        return DiscordRest.sendInfo(messageData.channel_id, guild, "getbirthday", trigger);
      }

      const regexUser = /^((<@!(?<id>\d*)>)|(?<name>.*))/;
      const resultUser = regexUser.exec(result.groups.user);

      if (!resultUser?.groups || (!resultUser?.groups.id && !resultUser?.groups.name)) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.no_user_found" });
      }

      const userInpt = resultUser.groups.id ? resultUser.groups.id : resultUser.groups.name.toLowerCase();

      const user = Helper.findUser(guild, userInpt);

      if (!user) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.no_user_found" });
      }

      const birthday = await DB.getInstance().getBirthday(guild.id, user.id);

      if (!birthday) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.birthday.no_birthday" });
      }
      let message = `${user.username}#${user.discriminator} - ${birthday.day}/${birthday.month}`;
      if (birthday.year) {
        message += `/${birthday.year}`;
      }
      DiscordRest.sendMessage(messageData.channel_id, message);
    } catch (e) {
      console.error("getBirthday", e);
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