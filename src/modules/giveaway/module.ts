import BaseModule from "#base-module";

import { AvailableLocales } from "@/types/discord";

import createCommand from "./commands/create.command";
import { getActiveGiveaways } from "./database";
import { GiveawayManager } from "./helpers/GiveawayManager";

export default class GiveawayModule extends BaseModule {
  private giveawayManagers: GiveawayManager[] = [];

  constructor(isActive: boolean) {
    super("giveaway", isActive);

    if (!isActive) {
      this.logger.info("Module deactivated");
      return;
    }

    this.commandDescription[AvailableLocales.English_US] =
      "Commands related to voting";

    this.commandList = {
      create: createCommand(this.logger, (giveaway) =>
        this.giveawayManagers.push(
          new GiveawayManager(this.logger, giveaway, (id) => {
            this.giveawayManagers = this.giveawayManagers.filter(
              (g) => g.id !== id
            );
          })
        )
      ),
    };
  }

  public async setUp(): Promise<void> {
    super.setUp();
    if (!this.isActive) {
      return;
    }

    const giveaways = await getActiveGiveaways();

    for (const giveaway of giveaways) {
      this.giveawayManagers.push(
        new GiveawayManager(this.logger, giveaway, (id) => {
          this.giveawayManagers = this.giveawayManagers.filter(
            (g) => g.id !== id
          );
        })
      );
    }
  }
}
