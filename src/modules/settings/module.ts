import BaseModule from "#/base-module";

import { AvailableLocales } from "@/types/discord";

import adminRoleCommand from "./commands/adminRole.command";

export default class SettingsModule extends BaseModule {
  constructor () {
    super("settings", true);

    this.commandDescription[AvailableLocales.English_US] =
      "Bot settings for this server";

    this.commandList = {
      admin_role: adminRoleCommand()
    };
  }
}
