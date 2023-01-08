import BaseModule from "../base-module";
import {
  getServerAnimeChannel,
  setServerAnimeChannel,
} from "../bot/database";
import { editOriginalInteractionResponse } from "../discord/rest";
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
  getAllAnimeNotifications,
  getUserSubs,
  setNextAiring,
} from "./database";
import {
  searchByQuery,
  searchByQueryAndType,
  searchForAiringSchedule,
  searchForUser,
  getAiringSchedule,
} from "./graphql";
import { mapAiringScheduleToEmbed } from "./mappers/mapAiringScheduleToEmbed";
import { mapMediaAiringToEmbed } from "./mappers/mapMediaAiringToEmbed";
import { mapMediaToEmbed } from "./mappers/mapMediaToEmbed";
import { mapSubListToEmbed } from "./mappers/mapSubListToEmbed";
import { IAnilistSubscription } from "./models/AnilistSubscription.model";
import {
  MediaSubbedInfo,
  MediaType,
} from "./types/graphql";
import { AnilistRateLimit } from "./rate-limiter";
import { AnimeManager } from "./anime-manager";

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
  private rateLimited = new AnilistRateLimit();
  private animeList: AnimeManager[] = [];

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
        const animeManager = new AnimeManager(
          this.logger,
          this.rateLimited,
          anime,
          this.removeAnime
        );
        animeManager.checkNextEpisode();
        this.animeList.push(animeManager);
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
        const animeManager = new AnimeManager(
          this.logger,
          this.rateLimited,
          nextAiringInfo,
          this.removeAnime
        );
        animeManager.checkNextEpisode();
        this.animeList.push(animeManager);
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
