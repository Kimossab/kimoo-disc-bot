import BaseModule from "#/base-module";

import { AvailableLocales } from "@/types/discord";

import createCommand from "./commands/create.command";
import deleteCommand from "./commands/delete.command";
import editCommand from "./commands/edit.command";
import giveCommand from "./commands/give.command";
import listCommand from "./commands/list.command";
import rankCommand from "./commands/rank.command";

export default class AchievementModule extends BaseModule {
  constructor(isActive: boolean) {
    super("achievements", isActive);

    if (!isActive) {
      this.logger.info("Module deactivated");
      return;
    }

    this.commandDescription[AvailableLocales.English_US] =
      "Handles everything related to achievements";

    this.commandList = {
      create: createCommand(this.logger),
      edit: editCommand(this.logger),
      delete: deleteCommand(this.logger),
      list: listCommand(this.logger),
      rank: rankCommand(this.logger),
      give: giveCommand(),
    };
  }
}
