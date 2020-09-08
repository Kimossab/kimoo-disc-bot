import Helper from "../helper";
import Log from "../logger";
import DiscordRest from "../discord/rest";

class BaseModule {
  protected _name: string = "";
  protected commandList: BotModule.command_info[] = [];
  protected translations: BotModule.translation_object = { pt: {}, en: {} };

  public get name(): string {
    return this._name;
  }

  public singleCommandHelp(guild: discord.guild, trigger: string, cmd: BotModule.command_info): BotModule.single_command_help {

    const cmdHelp = Helper.translationFromObject(this.translations, guild, `${cmd.name}.command`, { trigger });
    const cmdDescription = Helper.translationFromObject(this.translations, guild, `${cmd.name}.description`);
    const cmdParams = Helper.translationFromObject(this.translations, guild, `${cmd.name}.parameters`);

    let data: BotModule.single_command_help = {
      command: cmdHelp,
      description: cmdDescription
    };

    if (cmdParams !== "") {
      data.parameters = cmdParams;
    }

    return data;
  }

  public listHelp(guild: discord.guild, trigger: string): BotModule.single_command_help[] {
    const list: BotModule.single_command_help[] = [];

    if (this.translations) {
      for (const cmd of this.sortedCommandList()) {
        const data = this.singleCommandHelp(guild, trigger, cmd);

        list.push(data);
      }
    }

    return list;
  }

  protected infoLog(message: string, ...args: any[]) {
    Log.write(this._name, message, args);
  }

  protected errorLog(message: string, ...args: any[]) {
    Log.write(this._name, `[ERROR] ${message}`, args);
  }

  protected sendCommandHelp(guild: discord.guild, channel: string, command: string) {
    const trigger = Helper.getTrigger(guild);
    const cmd = this.commandList.find(c => c.name === command);

    if (cmd) {
      const helpData = this.singleCommandHelp(guild, trigger, cmd);

      const embed = Helper.commandHelpEmbed(guild);
      const fields = Helper.singleCommandHelpFields(guild, helpData);

      embed.fields = fields;

      DiscordRest.sendMessage(channel, "", embed);
    }
  }

  private sortedCommandList() {
    return this.commandList.sort((a, b) => {
      if (a.admin && b.admin) {
        return 0;
      }

      if (a.admin && !b.admin) {
        return 1;
      }

      return -1;
    });
  }
}

interface IModule extends BaseModule {
  runCommand(command: string, guild: discord.guild, trigger: string, messageData: discord.message, data: string[]): boolean;
  handleReaction(message: string, channel: string, emoji: string): void;
}

export { BaseModule, IModule };