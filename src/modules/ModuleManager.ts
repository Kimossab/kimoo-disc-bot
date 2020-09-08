import Log from "../logger";
import { IModule } from "./BaseModule";
import Weeb from "./weeb/Weeb";
import DiscordSocket from '../discord/socket';
import Helper from "../helper";

class ModuleManager {
  private static _instance: ModuleManager;
  private modules: IModule[] = [];

  public static getInstance() {
    if (!ModuleManager._instance) {
      ModuleManager._instance = new ModuleManager();
    }

    return ModuleManager._instance;
  }

  constructor() {
    if (!ModuleManager._instance) {
      this.modules = [
        new Weeb()
      ];
    }
  }

  public showHelp(guild: discord.guild, trigger: string): void {

    const commandData: string_object<BotModule.single_command_help[]> = {};

    for (const mod of this.modules) {
      commandData[mod.name] = mod.listHelp(guild, trigger);
    }

    //todo: complete

    Log.write('ModuleManager', "show help", commandData);
  }

  public static handleReaction(message: string, channel: string, emoji: string) {
    const manager = ModuleManager.getInstance();

    for (const mod of manager.modules) {
      mod.handleReaction(message, channel, emoji);
    }
  }

  public static handleMessage(messageData: discord.message) {
    if (messageData.author.bot) {
      return;
    }

    const socket = DiscordSocket.getInstance();
    if (!socket) {
      return;
    }

    const guildIndex = socket.guildList.findIndex(
      g => messageData.guild_id === g.id
    );
    const unscapedTrigger = Helper.getTrigger(socket.guildList[guildIndex]);
    const trigger = unscapedTrigger.replace(/\./g, '\\.');
    const regex = new RegExp("^" + trigger + "([^\\s]*)\\s?(.*)", "g");
    const regExec = regex.exec(messageData.content);

    if (!regExec) {
      return;
    }

    const splited = regExec.slice(1, 3);
    const manager = ModuleManager.getInstance();

    manager.runCommand(socket.guildList[guildIndex], unscapedTrigger, messageData, splited);
  }

  private runCommand(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]): void {
    if (data[0] === "help") {
      this.showHelp(guild, trigger);
    }
    else {
      let result = false;

      for (const mod of this.modules) {
        result = mod.runCommand(data[0], guild, trigger, messageData, data);

        if (result) {
          const user = (messageData.author as discord.user);

          Log.write('ModuleManager', `Executed command ${trigger}${data[0]} for ${user.username}#${user.discriminator} in ${guild.name}`);
          break;
        }
      }

      if (!result) {
        Log.write('ModuleManager', "Command not found", {
          guild: guild.name,
          trigger,
          messageData
        });
      }
    }
  }
}

export default ModuleManager;
