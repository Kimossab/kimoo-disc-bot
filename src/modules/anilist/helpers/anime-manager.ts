import { getServerAnimeChannel } from "@/bot/database";
import { sendMessage } from "@/discord/rest";
import { ILogger } from "@/helper/logger";

import {
  deleteAllSubscriptionsForId,
  getAllSubscriptionsForAnime,
  setNextAiring,
} from "../database";
import { getNextAiringEpisode, searchByScheduleId } from "../graphql/graphql";
import { mapMediaAiringToNewEpisodeEmbed } from "../mappers/mapMediaAiringToNewEpisodeEmbed";
import { IAnimeNotification } from "../models/animeNotification.model";
import { AiringSchedule } from "../types/graphql";
import {
  DEFAULT_TIMER,
  MAX_TIMER,
  MIN_TIME_TO_NOTIFY,
} from "./anime-manager-config";
import { IAnilistRateLimit } from "./rate-limiter";

export class AnimeManager {
  private timer: NodeJS.Timeout | undefined;

  public get id(): number {
    return this.anime.id;
  }

  constructor(
    private logger: ILogger,
    private rateLimiter: IAnilistRateLimit,
    private anime: IAnimeNotification,
    private onDelete: (id: number) => void
  ) {}

  public async checkNextEpisode() {
    if (!this.anime.nextAiring) {
      this.logger.log(
        "Next airing episode not available in the database",
        this.anime.id
      );
      await this.setNextEpisodeOrDelete();
      return;
    }

    const scheduleInfo = await searchByScheduleId(
      this.rateLimiter,
      this.anime.nextAiring
    );

    if (!scheduleInfo) {
      this.logger.log("No info found for airing id from Anilist", {
        nextAiring: this.anime.nextAiring,
        id: this.anime.id,
      });
      await this.setNextEpisodeOrDelete();
      return;
    }

    const { timeUntilAiring } = scheduleInfo.AiringSchedule;

    if (timeUntilAiring <= 0) {
      if (timeUntilAiring < MIN_TIME_TO_NOTIFY) {
        this.logger.log(
          "Next episode aired too long ago, not notifying",
          scheduleInfo.AiringSchedule
        );
      } else {
        this.logger.log(
          "Next episode aired already in the past",
          scheduleInfo.AiringSchedule
        );
        await this.notifyNewEpisode(scheduleInfo.AiringSchedule);

        // await setNextAiring(
        //   this.anime.id,
        //   media.nextAiringEpisode?.id || null
        // );
        // this.setTimer(
        //   media.nextAiringEpisode?.timeUntilAiring
        // );
      }

      await this.setNextEpisodeOrDelete();
    } else {
      this.setTimer(timeUntilAiring);
    }
  }

  private notifyNewEpisode = async (
    animeInfo: AiringSchedule
  ): Promise<void> => {
    this.logger.log("Notifying for new episode", animeInfo);

    const embed = mapMediaAiringToNewEpisodeEmbed(
      animeInfo.media,
      animeInfo.episode,
      animeInfo.airingAt
    );
    const subs = await getAllSubscriptionsForAnime(animeInfo.media.id);

    const servers = subs.map((s) => s.server);
    const uniqServers = [...new Set(servers)];

    for (const server of uniqServers) {
      const channel = await getServerAnimeChannel(server);
      if (channel) {
        const userMentions = subs
          .filter((s) => s.server === server)
          .map((s) => `<@${s.user}>`)
          .join("\n");

        await sendMessage(channel, userMentions, [embed]);
      }
    }
  };

  private setNextEpisodeOrDelete = async () => {
    const animeInfo = await getNextAiringEpisode(
      this.rateLimiter,
      this.anime.id
    );

    // this means the anime has ended, safe to delete
    if (!animeInfo) {
      this.logger.log(
        "No info about the anime found (either removed by anilist or finished airing) - deleting from database",
        this.anime.id
      );
      await deleteAllSubscriptionsForId(this.anime.id);
      this.onDelete(this.anime.id);
      return;
    }

    // if (!animeInfo.Media.nextAiringEpisode) {
    //   await setNextAiring(this.anime.id, null);
    //   this.setTimer();
    //   this.logger.log(
    //     "Next episode not found. Possibly not aired yet",
    //     {
    //       id: this.anime.id,
    //       nextEpisode: animeInfo.Media,
    //     }
    //   );
    //   return;
    // }

    const nextEpisode = animeInfo.Media.nextAiringEpisode;

    this.logger.log("Setting next episode in the database", {
      id: this.anime.id,
      nextEpisode,
    });
    await setNextAiring(this.anime.id, nextEpisode?.id ?? null);

    this.setTimer(nextEpisode?.timeUntilAiring);
  };

  private setTimer = (time: number = DEFAULT_TIMER) => {
    const timeToAir = Math.min(time * 1000, MAX_TIMER);
    this.logger.log(`Set timeout for ${this.anime.id} with ${timeToAir}ms`);

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => this.checkNextEpisode(), timeToAir);
  };
}
