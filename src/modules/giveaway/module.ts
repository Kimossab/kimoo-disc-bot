import BaseModule from "#base-module";
import { Locale } from "discord-api-types/v10";

import createCommand from "./commands/create.command";
import { getActiveGiveaways } from "./database";
import { GiveawayManager } from "./helpers/GiveawayManager";

export default class GiveawayModule extends BaseModule {
  private giveawayManagers: GiveawayManager[] = [];

  constructor (isActive: boolean) {
    super("giveaway", isActive);

    if (!isActive) {
      this.logger.info("Module deactivated");
      return;
    }

    this.commandDescription[Locale.EnglishUS] =
      "Commands related to voting";

    this.commandList = {
      create: createCommand(this.logger, (giveaway) => this.giveawayManagers.push(new GiveawayManager(this.logger, giveaway, (id) => {
        this.giveawayManagers = this.giveawayManagers.filter((g) => g.id !== id);
      })))
    };
  }

  public close () {
    super.close();
    this.giveawayManagers.forEach((g) => g.close());
    this.giveawayManagers = [];
  }

  public async setUp (): Promise<void> {
    super.setUp();
    if (!this.isActive) {
      return;
    }

    const giveaways = await getActiveGiveaways();

    for (const giveaway of giveaways) {
      this.giveawayManagers.push(new GiveawayManager(this.logger, giveaway, (id) => {
        this.giveawayManagers = this.giveawayManagers.filter((g) => g.id !== id);
      }));
    }
  }
}
