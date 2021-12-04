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
import { getOption } from "../helper/modules.helper";
import Pagination from "../helper/pagination";
import {
  addPagination,
  getApplication,
} from "../state/actions";
import { Embed } from "../types/discord";
import {
  addSubscription,
  deleteAllSubscriptionsForId,
  getAllAnimeNotifications,
  getAllSubscriptionsForAnime,
  getNextAiring,
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
  NextEpisode,
} from "./types/graphql";

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

export default class AnilistModule extends BaseModule {
  private animeNotificationTimer: string_object<NodeJS.Timeout> =
    {};

  constructor() {
    super("anilist");

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

    const ani = await getAllAnimeNotifications();

    for (const a of ani) {
      this.checkNotification(a.id);
    }
  }

  private setTimer = (
    id: number,
    time: number = DEFAULT_TIMER
  ) => {
    const timeToAir = Math.min(time * 1000, MAX_TIMER);
    this.logger.log(
      `Set timeout for ${id} with ${timeToAir}ms`
    );

    if (this.animeNotificationTimer[id]) {
      clearTimeout(this.animeNotificationTimer[id]);
    }

    this.animeNotificationTimer[id] = setTimeout(
      () => this.checkNotification(id),
      timeToAir
    );
  };

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

  private setNextEpisodeOrDelete = async (id: number) => {
    const animeInfo = await getNextAiringEpisode(id);

    // this means the anime has ended, safe to delete
    if (!animeInfo) {
      this.logger.log(
        "No info about the anime found (either removed by anilist or finished airing) - deleting from database",
        id
      );
      await deleteAllSubscriptionsForId(id);
      return;
    }

    const mostRecentEpisode =
      animeInfo.Media.airingSchedule.nodes?.reduce<NextEpisode | null>(
        (acc, cur) => {
          if (!acc && cur.timeUntilAiring < 0) {
            return cur;
          }

          return acc;
        },
        null
      );

    if (
      !animeInfo.Media.nextAiringEpisode &&
      (!mostRecentEpisode ||
        mostRecentEpisode.timeUntilAiring <
          MIN_TIME_TO_NOTIFY)
    ) {
      await setNextAiring(id, null);
      this.setTimer(id);
      this.logger.log(
        "Next episode not found and previous can't be notified",
        {
          id,
          nextEpisode: animeInfo.Media.nextAiringEpisode,
          mostRecentEpisode,
        }
      );
      return;
    }

    const nextEpisode =
      animeInfo.Media.nextAiringEpisode ||
      mostRecentEpisode;

    this.logger.log(
      "Setting next episode in the database",
      { id, nextEpisode }
    );
    await setNextAiring(id, nextEpisode?.id || null);

    this.setTimer(id, nextEpisode?.timeUntilAiring);
    return;
  };

  private checkNotification = async (id: number) => {
    this.logger.log("Checking for new episode", id);

    // get database info
    const nextAiring = await getNextAiring(id);

    // if there's no info in the database then I should ask for the next episode
    if (!nextAiring || !nextAiring.nextAiring) {
      await this.setNextEpisodeOrDelete(id);
      return;
    }

    const scheduleInfo = await searchByScheduleId(
      nextAiring.nextAiring,
      this.logger
    );

    // they deleted an id
    if (!scheduleInfo) {
      this.logger.log("No info found for airing id", {
        nextAiring,
        id,
      });

      await this.setNextEpisodeOrDelete(id);
      return;
    }

    if (scheduleInfo.AiringSchedule.timeUntilAiring <= 0) {
      this.notifyNewEpisode(scheduleInfo.AiringSchedule);

      await setNextAiring(
        id,
        scheduleInfo.AiringSchedule.media.nextAiringEpisode
          ?.id || null
      );
      this.setTimer(
        id,
        scheduleInfo.AiringSchedule.media.nextAiringEpisode
          ?.timeUntilAiring
      );
    } else {
      this.setTimer(
        id,
        scheduleInfo.AiringSchedule.timeUntilAiring
      );
    }
  };

  private pageUpdate = async (
    data: Embed,
    _page: number,
    _total: number,
    token: string
  ): Promise<void> => {
    const app = getApplication();
    if (app && app.id) {
      await editOriginalInteractionResponse(app.id, token, {
        content: "",
        embeds: [data],
      });
    }
  };

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
        ? searchByQueryAndType(query, type, this.logger)
        : searchByQuery(query, this.logger));

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
      const message = await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: "",
          embeds: [embedList[0]],
        }
      );

      if (message && embedList.length > 1) {
        const pagination = new Pagination<Embed>(
          data.channel_id,
          message.id,
          embedList,
          this.pageUpdate,
          data.token
        );

        addPagination(pagination);
      }
    }
  };

  private handleSubCommand: CommandHandler = async (
    data,
    option
  ) => {
    const subCommands: string_object<CommandHandler> = {
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
        query,
        this.logger
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
        anime,
        this.logger
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

      const nextAiring = animeInfo.Media.nextAiringEpisode;
      if (
        !this.animeNotificationTimer[animeInfo.Media.id]
      ) {
        this.setTimer(
          animeInfo.Media.id,
          nextAiring?.timeUntilAiring
        );
      }

      await addSubscription(
        data.guild_id,
        data.member.user?.id || "",
        animeInfo.Media.id
      );

      await setNextAiring(
        animeInfo.Media.id,
        nextAiring?.id || null
      );

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
          chunk.map((s) => s.id),
          this.logger
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

      const message = await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: "",
          embeds: [
            mapSubListToEmbed(chunks[0], 1, chunks.length),
          ],
        }
      );

      if (message && chunks.length > 1) {
        const pagination = new Pagination<
          MediaSubbedInfo[]
        >(
          data.channel_id,
          message.id,
          chunks,
          this.updateUserSubListEmbed,
          data.token
        );

        addPagination(pagination);
      }
    }
  };

  private updateUserSubListEmbed = async (
    data: MediaSubbedInfo[],
    page: number,
    total: number,
    token: string
  ): Promise<void> => {
    const app = getApplication();
    if (app && app.id) {
      await editOriginalInteractionResponse(app.id, token, {
        content: "",
        embeds: [mapSubListToEmbed(data, page, total)],
      });
    }
  };
}
