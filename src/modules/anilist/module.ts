import BaseModule from "#/base-module";

import { AvailableLocales } from "@/types/discord";

import channelCommand from "./commands/channel.command";
import scheduleCommand from "./commands/schedule.command";
import searchCommand from "./commands/search.command";
import subCommand from "./commands/sub.command";
import { getAllAnimeLastAiring } from "./database";
import { AnimeManager } from "./helpers/anime-manager";
import { AnilistRateLimit } from "./helpers/rate-limiter";

export default class AnilistModule extends BaseModule {
  private rateLimiter = new AnilistRateLimit();
  private animeList: AnimeManager[] = [];

  constructor(isActive: boolean) {
    super("anilist", isActive);

    if (!isActive) {
      this.logger.log("Module deactivated");
      return;
    }

    this.commandDescription[AvailableLocales.English_US] =
      "Commands related to anilist";

    this.commandList = {
      search: searchCommand(this.logger, this.rateLimiter),
      sub: subCommand(
        this.logger,
        this.rateLimiter,
        this.animeList,
        this.removeAnime
      ),
      schedule: scheduleCommand(this.logger, this.rateLimiter),
      channel: channelCommand(this.logger),
    };
  }

  public async setUp(): Promise<void> {
    super.setUp();
    if (!this.isActive) {
      return;
    }

    const ani = await getAllAnimeLastAiring();

    for (const anime of ani) {
      if (!this.animeList.find((a) => a.id === anime.id)) {
        const animeManager = new AnimeManager(
          this.logger,
          this.rateLimiter,
          anime.id,
          this.removeAnime
        );
        // animeManager.checkNextEpisode();
        this.animeList.push(animeManager);
      }
    }
  }

  private removeAnime = (id: number) => {
    this.animeList = this.animeList.filter((anime) => anime.id !== id);
  };
}
