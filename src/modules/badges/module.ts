import BaseModule from "#/base-module";

import { AvailableLocales } from "@/types/discord";

import createCommand from "./commands/create.command";
import deleteCommand from "./commands/delete.command";
import giveCommand from "./commands/give.command";
import listCommand from "./commands/list.command";
import userCommand from "./commands/user.command";

export default class BadgesModule extends BaseModule {
  constructor(isActive: boolean) {
    super("badges", isActive);

    if (!isActive) {
      this.logger.info("Module deactivated");
      return;
    }

    this.commandDescription[AvailableLocales.English_US] = "Badges commands";

    this.commandList = {
      create: createCommand(this.logger),
      list: listCommand(this.logger),
      give: giveCommand(this.logger),
      user: userCommand(this.logger),
      delete: deleteCommand(this.logger),
    };
  }
}
