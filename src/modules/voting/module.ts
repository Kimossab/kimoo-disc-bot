import BaseModule from "#base-module";

import { AvailableLocales } from "@/types/discord";

import createCommand from "./commands/create.command";

export default class VotingModule extends BaseModule {
  constructor(isActive: boolean) {
    super("voting", isActive);

    if (!isActive) {
      this.logger.log("Module deactivated");
      return;
    }

    this.commandDescription[AvailableLocales.English_US] =
      "Commands related to voting";

    this.commandList = {
      create: createCommand(this.logger),
    };
  }

  public async setUp(): Promise<void> {
    super.setUp();
    if (!this.isActive) {
      return;
    }
  }
}
