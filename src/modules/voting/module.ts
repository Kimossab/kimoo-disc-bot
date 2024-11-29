import BaseModule from "#base-module";
import { Locale } from "discord-api-types/v10";


import createCommand from "./commands/create.command";

export default class VotingModule extends BaseModule {
  constructor (isActive: boolean) {
    super("voting", isActive);

    if (!isActive) {
      this.logger.info("Module deactivated");
      return;
    }

    this.commandDescription[Locale.EnglishUS] =
      "Commands related to voting";

    this.commandList = {
      create: createCommand(this.logger)
    };
  }

  public async setUp (): Promise<void> {
    super.setUp();
    if (!this.isActive) {
      return;
    }
  }
}
