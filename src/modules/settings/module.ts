import BaseModule from "#/base-module";
import { Locale } from "discord-api-types/v10";


import adminRoleCommand from "./commands/adminRole.command";

export default class SettingsModule extends BaseModule {
  constructor () {
    super("settings", true);

    this.commandDescription[Locale.EnglishUS] =
      "Bot settings for this server";

    this.commandList = {
      admin_role: adminRoleCommand()
    };
  }
}
