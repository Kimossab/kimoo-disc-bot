import BaseModule from "#/base-module";

import { AvailableLocales } from "@/types/discord";

import donutCommand from "./commands/donut.command";
import groupCommand from "./commands/group.command";

export default class MiscModule extends BaseModule {
  constructor(isActive: boolean) {
    super("misc", isActive);

    if (!isActive) {
      this.logger.log("Module deactivated");
      return;
    }

    this.commandDescription[AvailableLocales.English_US] =
      "Miscellaneous commands";

    this.commandList = {
      group: groupCommand(),
      donut: donutCommand(this.logger),
    };
  }
}
