import weebTranslation from "./translations";
import { BaseModule, IModule } from "../BaseModule";
import SauceNao from './SauceNao';
import Fandom from "./Fandom";
import Helper from "../../helper";
import DiscordRest from "../../discord/rest";
import Mal from "./Mal";

class Weeb extends BaseModule implements IModule {
  private sauceNao: SauceNao;
  private fandom: Fandom;
  private mal: Mal;

  constructor() {
    super();

    this._name = "weeb";
    this.translations = weebTranslation;
    this.commandList = [
      { name: 'sauce', admin: false },
      { name: 'wiki', admin: false },
      { name: 'mal', admin: false }
    ];

    this.sauceNao = new SauceNao();
    this.fandom = new Fandom();
    this.mal = new Mal();
  }

  public runCommand(command: string, guild: discord.guild, trigger: string, messageData: discord.message, data: string[]): boolean {
    switch (command) {
      case 'sauce':
        this.sauce(guild, messageData);
        return true;

      case 'wiki':
        this.wiki(guild, messageData, data);
        return true;

      case 'mal':
        this.searchMal(guild, messageData, data);
        return true;
    }

    return false;
  }

  public handleReaction(message: string, channel: string, emoji: string) {
    if (emoji === "⬅" || emoji === "➡") {
      this.sauceNao.handlePageChange(message, channel, emoji);
      this.fandom.handlePageChange(message, channel, emoji);
    }
  }

  private async sauce(guild: discord.guild, messageData: discord.message) {
    const result = await this.sauceNao.sauce(messageData);

    if (!result.success) {
      const message = Helper.translationFromObject(this.translations, guild, result.data!.message);

      DiscordRest.sendMessage(messageData.channel_id, message);
    }
  }

  private async wiki(guild: discord.guild, messageData: discord.message, data: string[]) {
    const result = await this.fandom.searchWiki(guild, messageData, data);

    if (result.status === 1) {
      this.sendCommandHelp(guild, messageData.channel_id, "wiki");
    }
    else if (!result.success) {
      const message = Helper.translationFromObject(this.translations, guild, result.data!.message, result.data!.replaces);

      DiscordRest.sendMessage(messageData.channel_id, message);
    }
  }

  private async searchMal(guild: discord.guild, messageData: discord.message, data: string[]) {
    const result = await this.mal.searchMal(messageData, data);

    this.infoLog('searchMal', result);

    if (result.status === 1) {
      this.sendCommandHelp(guild, messageData.channel_id, "mal");
    }
    else if (!result.success) {
      const message = Helper.translationFromObject(this.translations, guild, result.data!.message, result.data!.replaces ?? null);

      DiscordRest.sendMessage(messageData.channel_id, message);
    }
  }
}

export default Weeb;

