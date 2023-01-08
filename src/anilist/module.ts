import BaseModule from "../base-module";
import {
  getServerAnimeChannel,
  setServerAnimeChannel,
} from "../bot/database";
import {
  editOriginalInteractionResponse,
  sendMessage,
} from "../discord/rest";
import {
  chunkArray,
  stringReplacer,
} from "../helper/common";
import messageList from "../helper/messages";
import { getOption } from "../helper/modules";
import {
  CreatePageCallback,
  InteractionPagination,
} from "../helper/interaction-pagination";
import {
  addPagination,
  getApplication,
} from "../state/store";
import { Embed } from "../types/discord";
import {
  addSubscription,
  deleteAllSubscriptionsForId,
  getAllAnimeNotifications,
  getAllSubscriptionsForAnime,
  getUserSubs,
  setNextAiring,
} from "./database";
import {
  searchByQuery,
  searchByQueryAndType,
  searchForAiringSchedule,
  searchByScheduleId,
  searchForUser,
  getNextAiringEpisode,
  getAiringSchedule,
} from "./graphql";
import { mapAiringScheduleToEmbed } from "./mappers/mapAiringScheduleToEmbed";
import { mapMediaAiringToEmbed } from "./mappers/mapMediaAiringToEmbed";
import { mapMediaAiringToNewEpisodeEmbed } from "./mappers/mapMediaAiringToNewEpisodeEmbed";
import { mapMediaToEmbed } from "./mappers/mapMediaToEmbed";
import { mapSubListToEmbed } from "./mappers/mapSubListToEmbed";
import { IAnilistSubscription } from "./models/AnilistSubscription.model";
import {
  AiringSchedule,
  MediaSubbedInfo,
  MediaType,
} from "./types/graphql";
import { AnilistRateLimit } from "./rate-limiter";
import Logger from "../helper/logger";
import { IAnimeNotification } from "./models/animeNotification.model";

const DEFAULT_TIMER = 24 * 60 * 60; // 1 day in seconds
const MAX_TIMER = 2147483647; // +- 23 days
const MIN_TIME_TO_NOTIFY = -60 * 60; //  1 hour in seconds

interface ScheduleCommandOptions {
  query: string;
  type: MediaType;
}
interface SearchCommandOptions {
  query: string;
  type: MediaType;
}
interface SubAddCommandOptions {
  anime: string;
}
interface ChannelCommandOptions {
  channel: string;
}

class AnilistAnimeHandler {
  private timer: NodeJS.Timeout | undefined;

  public get id(): number {
    return this.anime.id;
  }

  constructor(
    private logger: Logger,
    private rateLimiter: AnilistRateLimit,
    private anime: IAnimeNotification,
    private onDelete: (id: number) => void
  ) {
    this.checkNextEpisode();
  }

  private async checkNextEpisode() {
    if (!this.anime.nextAiring) {
      this.logger.log(
        "Next airing episode not available in the database",
        this.anime.id
      );
      this.setNextEpisodeOrDelete();
      return;
    }

    const scheduleInfo = await searchByScheduleId(
      this.rateLimiter,
      this.anime.nextAiring
    );

    if (!scheduleInfo) {
      this.logger.log(
        "No info found for airing id from Anilist",
        {
          nextAiring: this.anime.nextAiring,
          id: this.anime.id,
        }
      );
      this.setNextEpisodeOrDelete();
      return;
    }

    const { timeUntilAiring } = scheduleInfo.AiringSchedule;

    if (timeUntilAiring <= 0) {
      if (timeUntilAiring < MIN_TIME_TO_NOTIFY) {
        this.logger.log(
          "Next episode aired too long ago, not notifying",
          scheduleInfo.AiringSchedule
        );
        this.setNextEpisodeOrDelete();
      } else {
        this.logger.log(
          "Next episode aired already in the past",
          scheduleInfo.AiringSchedule
        );
        this.notifyNewEpisode(scheduleInfo.AiringSchedule);

        this.setNextEpisodeOrDelete();
        // await setNextAiring(
        //   this.anime.id,
        //   media.nextAiringEpisode?.id || null
        // );
        // this.setTimer(
        //   media.nextAiringEpisode?.timeUntilAiring
        // );
      }
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
    const subs = await getAllSubscriptionsForAnime(
      animeInfo.media.id
    );

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

    if (!animeInfo.Media.nextAiringEpisode) {
      await setNextAiring(this.anime.id, null);
      this.logger.log(
        "Next episode not found. Possibly not aired yet",
        {
          id: this.anime.id,
          nextEpisode: animeInfo.Media,
        }
      );
      return;
    }

    const nextEpisode = animeInfo.Media.nextAiringEpisode;

    this.logger.log(
      "Setting next episode in the database",
      { id: this.anime.id, nextEpisode }
    );
    await setNextAiring(
      this.anime.id,
      nextEpisode?.id ?? null
    );

    this.setTimer(nextEpisode?.timeUntilAiring);
    return;
  };

  private setTimer = (time: number = DEFAULT_TIMER) => {
    const timeToAir = Math.min(time * 1000, MAX_TIMER);
    this.logger.log(
      `Set timeout for ${this.anime.id} with ${timeToAir}ms`
    );

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(
      () => this.checkNextEpisode(),
      timeToAir
    );
  };
}

export default class AnilistModule extends BaseModule {
  private rateLimited = new AnilistRateLimit();
  private animeList: AnilistAnimeHandler[] = [];

  constructor(isActive: boolean) {
    super("anilist", isActive);

    if (!isActive) {
      this.logger.log("Module deactivated");
      return;
    }

    this.commandList = {
      search: {
        handler: this.handleSearchCommand,
      },
      sub: {
        handler: this.handleSubCommand,
      },
      schedule: {
        handler: this.handleScheduleCommand,
      },
      channel: {
        isAdmin: true,
        handler: this.handleChannelCommand,
      },
    };
  }

  public async setUp(): Promise<void> {
    super.setUp();
    if (!this.isActive) {
      return;
    }

    const ani = await getAllAnimeNotifications();

    for (const anime of ani) {
      if (!this.animeList.find((a) => a.id === anime.id)) {
        this.animeList.push(
          new AnilistAnimeHandler(
            this.logger,
            this.rateLimited,
            anime,
            this.removeAnime
          )
        );
      }
    }
  }

  private removeAnime = (id: number) => {
    this.animeList = this.animeList.filter(
      (anime) => anime.id !== id
    );
  };

  private pageUpdate: CreatePageCallback<Embed> = async (
    _page,
    _total,
    data
  ) => ({
    data: {
      embeds: [data],
    },
  });

  private handleSearchCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { query, type } =
        this.getOptions<SearchCommandOptions>(
          ["query", "type"],
          option.options
        );

      const allData = await (type
        ? searchByQueryAndType(
            this.rateLimited,
            query,
            type
          )
        : searchByQuery(this.rateLimited, query));

      if (!allData) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.anilist.not_found,
          }
        );
        return;
      }

      const embedList = mapMediaToEmbed(allData);

      if (embedList.length === 0) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.anilist.not_found,
          }
        );
        return;
      }

      this.logger.log("Embed in index 5", embedList[5]);

      const pagination = new InteractionPagination(
        app.id,
        embedList,
        this.pageUpdate
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);
    }
  };

  private handleSubCommand: CommandHandler = async (
    data,
    option
  ) => {
    const subCommands: Record<string, CommandHandler> = {
      add: this.handleSubAdd,
      list: this.handleSubList,
    };

    for (const cmd of Object.keys(subCommands)) {
      const cmdData = getOption(option.options, cmd);

      if (cmdData) {
        return await subCommands[cmd](data, cmdData);
      }
    }
  };

  private handleScheduleCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { query } =
        this.getOptions<ScheduleCommandOptions>(
          ["query"],
          option.options
        );

      const allData = await getAiringSchedule(
        this.rateLimited,
        query
      );

      if (!allData) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.anilist.not_found,
          }
        );
        return;
      }

      if (!allData.Media) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.anilist.not_found,
          }
        );
        return;
      }

      const embed = mapAiringScheduleToEmbed(allData.Media);
      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: "",
          embeds: [embed],
        }
      );
    }
  };

  private handleChannelCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { channel } =
        this.getOptions<ChannelCommandOptions>(
          ["channel"],
          option.options
        );

      if (channel) {
        await setServerAnimeChannel(data.guild_id, channel);
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: stringReplacer(
              messageList.anilist.channel_set_success,
              {
                channel: `<#${channel}>`,
              }
            ),
          }
        );
        this.logger.log(
          `Set Anime channel to ${channel} in ${data.guild_id} by ` +
            `${data.member.user?.username}#${data.member.user?.discriminator}`
        );
      } else {
        const ch = await getServerAnimeChannel(
          data.guild_id
        );
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: stringReplacer(
              messageList.anilist.server_channel,
              {
                channel: `<#${ch}>`,
              }
            ),
          }
        );
        this.logger.log(
          `Get anime channel in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
        );
      }
    }
  };

  private handleSubAdd: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { anime } =
        this.getOptions<SubAddCommandOptions>(
          ["anime"],
          option.options
        );

      const animeInfo = await searchForAiringSchedule(
        this.rateLimited,
        anime
      );

      if (!animeInfo) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.anilist.not_found,
          }
        );
        return;
      }

      await addSubscription(
        data.guild_id,
        data.member.user?.id || "",
        animeInfo.Media.id
      );

      const nextAiring = animeInfo.Media.nextAiringEpisode;
      const nextAiringInfo = await setNextAiring(
        animeInfo.Media.id,
        nextAiring?.id || null
      );

      if (
        !this.animeList.find(
          (anime) => anime.id === animeInfo.Media.id
        )
      ) {
        this.animeList.push(
          new AnilistAnimeHandler(
            this.logger,
            this.rateLimited,
            nextAiringInfo,
            this.removeAnime
          )
        );
      }

      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: ``,
          embeds: [mapMediaAiringToEmbed(animeInfo.Media)],
        }
      );
    }
  };

  private handleSubList: CommandHandler = async (data) => {
    const app = getApplication();
    if (app && app.id) {
      const subs = await getUserSubs(
        data.guild_id,
        data.member.user?.id || ""
      );

      if (subs.length === 0) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: "No subscriptions",
          }
        );

        return;
      }
      const subsChunk = chunkArray<IAnilistSubscription>(
        subs,
        25
      );

      const animeInfo = [];

      for (const chunk of subsChunk) {
        const info = await searchForUser(
          this.rateLimited,
          chunk.map((s) => s.id)
        );

        if (info && info.Page.media.length > 0) {
          animeInfo.push(...info.Page.media);
        }
      }

      if (animeInfo.length === 0) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: "No subscriptions",
          }
        );

        return;
      }

      const chunks = chunkArray<MediaSubbedInfo>(
        animeInfo,
        25
      );

      const pagination = new InteractionPagination(
        app.id,
        chunks,
        this.updateUserSubListEmbed
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);
    }
  };

  private updateUserSubListEmbed: CreatePageCallback<
    MediaSubbedInfo[]
  > = async (page, total, data) => {
    return {
      data: {
        embeds: [mapSubListToEmbed(data, page, total)],
      },
    };
  };
}
