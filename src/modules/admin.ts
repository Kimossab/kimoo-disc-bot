import DiscordRest from "../discord/rest";
import DB from "../database";
import DiscordSocket from "../discord/socket";
import Helper from "../helper";

class Admin {
  public static checkOwner(guild: discord.guild, user_id: string): boolean {
    return guild.owner_id === user_id;
  }

  public static checkAdmin(guild: discord.guild, user_id: string): boolean {
    if (Admin.checkOwner(guild, user_id)) {
      return true;
    }

    const role = guild.settings.admin_role;

    if (!role) {
      return false;
    }

    const member = guild.members?.find(m => m.user.id === user_id);
    if (!member) {
      return false;
    }

    return member.roles.includes(role);
  }

  public static async setAdminRole(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    try {
      if (!Admin.checkOwner(guild, messageData.author.id)) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.permission" });
      }

      const regex = /^((<@&(?<id>\d*)>)|(?<name>.*))/;
      const result = regex.exec(data[1]);

      if (!result?.groups || (!result?.groups.id && !result?.groups.name)) {
        return DiscordRest.sendInfo(messageData.channel_id, guild, "setadminrole", trigger);
      }

      const roleName = result.groups.id ? result.groups.id : result.groups.name.toLocaleLowerCase();

      const role = guild.roles.find(r => r.id === roleName || r.name.toLowerCase() === roleName);

      if (!role) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.admin.no_role" });
      }

      const socket = DiscordSocket.getInstance();
      if (!socket) {
        return;
      }

      const index = socket.guildList.findIndex(g => g.id === guild.id);

      if (index < 0) {
        return;
      }

      guild.settings.admin_role = role.id;

      socket.guildList[index].settings = await DB.getInstance().updateServerSettings(guild.settings);

      const translation = Helper.translation(guild, "success.setadminrole");
      DiscordRest.sendMessage(messageData.channel_id, translation);
    } catch (e) {
      console.error(e);
    }
  }

  public static async setTrigger(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    try {
      if (!Admin.checkOwner(guild, messageData.author.id)) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.permission" });
      }

      if (data[1] === "") {
        return DiscordRest.sendInfo(messageData.channel_id, guild, "settrigger", trigger);
      }

      const newTrigger = data[1];

      const socket = DiscordSocket.getInstance();
      if (!socket) {
        return;
      }

      const index = socket.guildList.findIndex(g => g.id === guild.id);

      if (index < 0) {
        return;
      }

      socket.guildList[index].settings.cmd_trigger = newTrigger;

      socket.guildList[index].settings = await DB.getInstance().updateServerSettings(socket.guildList[index].settings);

      const translation = Helper.translation(guild, "success.settrigger", { "trigger": newTrigger });
      DiscordRest.sendMessage(messageData.channel_id, translation);
    } catch (e) {
      console.error(e);
    }
  }

  public static async setLanguage(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    try {
      if (!Admin.checkOwner(guild, messageData.author.id)) {
        return DiscordRest.sendError(messageData.channel_id, guild, { key: "errors.permission" });
      }

      if (data[1] !== "pt" && data[1] !== "en") {
        return DiscordRest.sendInfo(messageData.channel_id, guild, "setlanguage", trigger);
      }

      const newLang = data[1];

      const socket = DiscordSocket.getInstance();
      if (!socket) {
        return;
      }

      const index = socket.guildList.findIndex(g => g.id === guild.id);

      if (index < 0) {
        return;
      }

      socket.guildList[index].settings.bot_lang = newLang;

      socket.guildList[index].settings = await DB.getInstance().updateServerSettings(socket.guildList[index].settings);

      const translation = Helper.translation(socket.guildList[index], "success.setlanguage", { "lang": newLang });
      DiscordRest.sendMessage(messageData.channel_id, translation);
    } catch (e) {
      console.error(e);
    }
  }
}

export default Admin;