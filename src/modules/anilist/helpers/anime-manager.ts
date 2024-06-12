import {
  getAllSubscriptionsForAnime,
  getAnimeLastAiringById,
  updateAnimeLastAiring
} from "#anilist/database";
import { getFullAiringSchedule } from "#anilist/graphql/graphql";
import { mapMediaAiringToNewEpisodeEmbed } from "#anilist/mappers/mapMediaAiringToNewEpisodeEmbed";
import {
  InfoWithSchedule,
  MediaStatus,
  NextEpisode
} from "#anilist/types/graphql";

import { getServer } from "@/database";
import { sendMessage } from "@/discord/rest";
import { ILogger } from "@/helper/logger";

import { MAX_TIMER } from "./anime-manager-config";
import { IAnilistRateLimit, RequestStatus } from "./rate-limiter";

interface LastAndNextEpisodeInfo {
  last: NextEpisode | null;
  next: NextEpisode | null;
}

export const getLastAndNextEpisode = (scheduleInformation: InfoWithSchedule["airingSchedule"]): LastAndNextEpisodeInfo => {
  return (scheduleInformation.nodes ?? []).reduce<LastAndNextEpisodeInfo>(
    (res, info) => {
      if (
        info.timeUntilAiring <= 0 &&
        (!res.last || res.last.timeUntilAiring < info.timeUntilAiring)
      ) {
        res.last = info;
      }
      if (
        info.timeUntilAiring > 0 &&
        (!res.next || res.next.timeUntilAiring > info.timeUntilAiring)
      ) {
        res.next = info;
      }
      return res;
    },
    {
      last: null,
      next: null
    }
  );
};

export class AnimeManager {
  private timer: NodeJS.Timeout | undefined;

  public get id (): number {
    return this.animeId;
  }

  constructor (
    private logger: ILogger,
    private rateLimiter: IAnilistRateLimit,
    private animeId: number,
    private onDelete: (id: number) => void
  ) {}

  public stop () {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  public async checkNextEpisode () {
    const animeInformation = await getFullAiringSchedule(
      this.rateLimiter,
      this.animeId
    );

    if (animeInformation.status === RequestStatus.Not_Found) {
      // todo: to change to info
      this.logger.error(
        "No info about the anime found (either removed by anilist or finished airing) - deleting from database",
        {
          animeId: this.animeId
        }
      );

      if (process.env.OWNER_DM_CHANNEL) {
        await sendMessage(
          process.env.OWNER_DM_CHANNEL,
          `Deleting anilist ${this.animeId}`
        );
      }
      // await deleteAllSubscriptionsForId(this.animeId);
      this.onDelete(this.animeId);
      return;
    } else if (animeInformation.status !== RequestStatus.OK) {
      this.setTimer(1 * 60 * 1000); // 1 minute
      return;
    }

    const lastAiredDb = await getAnimeLastAiringById(this.animeId);
    const { last, next } = getLastAndNextEpisode(animeInformation.data.Media.airingSchedule);

    if (last && last.episode !== Number(lastAiredDb?.lastAired)) {
      this.logger.info("Last aired episode is different from database", {
        db: lastAiredDb,
        last
      });
      await this.notifyNewEpisode(animeInformation.data.Media, last, next);
    }

    if (
      ![
        MediaStatus.NOT_YET_RELEASED,
        MediaStatus.RELEASING,
        MediaStatus.HIATUS
      ].includes(animeInformation.data.Media.status)
    ) {
      this.logger.error(
        "Anime status not one of (NOT_YET_RELEASED,RELEASING,HIATUS) - assuming it's over - deleting from db",
        animeInformation
      );
      if (process.env.OWNER_DM_CHANNEL) {
        await sendMessage(
          process.env.OWNER_DM_CHANNEL,
          `Deleting anilist ${this.animeId}`
        );
      }
      // await deleteAllSubscriptionsForId(this.animeId);
      this.onDelete(this.animeId);
      return;
    }

    this.setTimer(next?.timeUntilAiring);
  }

  private notifyNewEpisode = async (
    animeInfo: InfoWithSchedule,
    episodeInfo: NextEpisode,
    nextEpisodeInfo: NextEpisode | null
  ): Promise<void> => {
    this.logger.info("Notifying for new episode", {
      id: animeInfo.id,
      name: animeInfo.title,
      episodeInfo,
      nextEpisodeInfo
    });

    const embed = mapMediaAiringToNewEpisodeEmbed(
      animeInfo,
      episodeInfo,
      nextEpisodeInfo
    );
    const subs = await getAllSubscriptionsForAnime(animeInfo.id);

    const servers = subs.map((s) => s.serverId);
    const uniqServers = [...new Set(servers)];

    for (const server of uniqServers) {
      const channel = (await getServer(server))?.animeChannel;

      if (channel) {
        const userMentions = subs
          .filter((s) => s.serverId === server)
          .map((s) => `<@${s.user}>`)
          .join("\n");

        await sendMessage(channel, userMentions, [embed]);
      }
    }

    await updateAnimeLastAiring(animeInfo.id, episodeInfo.episode);
  };

  private setTimer = (time: number = MAX_TIMER) => {
    const timeToAir = Math.min(time * 1000, MAX_TIMER);
    this.logger.info(`Set timeout for ${this.animeId} with ${timeToAir}ms`);

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => this.checkNextEpisode(), timeToAir);
  };
}
