import BaseModule from "#/base-module";

import { AvailableLocales } from "@/types/discord";

import avatarCommand from "./commands/avatar.command";
import donutCommand from "./commands/donut.command";
import groupCommand from "./commands/group.command";

export default class MiscModule extends BaseModule {
  constructor (isActive: boolean) {
    super("misc", isActive);

    if (!isActive) {
      this.logger.info("Module deactivated");
      return;
    }

    this.commandDescription[AvailableLocales.English_US] =
      "Miscellaneous commands";

    this.commandList = {
      group: groupCommand(),
      donut: donutCommand(this.logger),
      avatar: avatarCommand()
    };
  }
}
