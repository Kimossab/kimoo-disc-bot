import BaseModule from "#/base-module";

import { AnilistRateLimit } from "./helpers/rate-limiter";
import { AnimeManager } from "./helpers/anime-manager";
import { Locale } from "discord-api-types/v10";
import { getAllAnimeLastAiring } from "./database";
import channelCommand from "./commands/channel.command";
import scheduleCommand from "./commands/schedule.command";
import searchCommand from "./commands/search.command";
import subCommand from "./commands/sub.command";
import upcomingCommand from "./commands/upcoming.command";

export default class AnilistModule extends BaseModule {
  private rateLimiter = new AnilistRateLimit();

  private animeList: AnimeManager[] = [];

  constructor(isActive: boolean) {
    super("anilist", isActive);

    if (!isActive) {
      this.logger.info("Module deactivated");
      return;
    }

    this.commandDescription[Locale.EnglishUS]
      = "Commands related to anilist";

    this.commandList = {
      search: searchCommand(this.logger, this.rateLimiter),
      sub: subCommand(
        this.logger,
        this.rateLimiter,
        this.animeList,
        this.removeAnime,
      ),
      schedule: scheduleCommand(this.logger, this.rateLimiter),
      channel: channelCommand(),
      upcoming: upcomingCommand(this.logger, this.rateLimiter),
    };
  }

  public close() {
    super.close();
    this.animeList.forEach(a => a.stop());
    this.animeList = [];
    this.rateLimiter.clear();
  }

  public async setUp(): Promise<void> {
    super.setUp();
    if (!this.isActive) {
      return;
    }

    const ani = await getAllAnimeLastAiring();

    for (const anime of ani) {
      if (!this.animeList.find(a => a.id === anime.animeId)) {
        const animeManager = new AnimeManager(
          this.logger,
          this.rateLimiter,
          anime.animeId,
          this.removeAnime,
        );
        animeManager.checkNextEpisode();
        this.animeList.push(animeManager);
      }
    }
  }

  private removeAnime = (id: number) => {
    this.animeList = this.animeList.filter(anime => anime.id !== id);
  };
}
