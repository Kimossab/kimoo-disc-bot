import BaseModule from "../base-module";
import { getServerAnimeChannel } from "../bot/database";
import {
  editOriginalInteractionResponse,
  sendMessage,
} from "../discord/rest";
import { chunkArray } from "../helper/common";
import messageList from "../helper/messages";
import { getOption } from "../helper/modules.helper";
import Pagination from "../helper/pagination";
import {
  addPagination,
  getApplication,
} from "../state/actions";
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
  searchForAiringScheduleById,
  searchForUser,
} from "./graphql";
import { mapMediaAiringToEmbed } from "./mappers/mapMediaAiringToEmbed";
import { mapMediaAiringToNewEpisodeEmbed } from "./mappers/mapMediaAiringToNewEpisodeEmbed";
import { mapMediaToEmbed } from "./mappers/mapMediaToEmbed";
import { mapSubListToEmbed } from "./mappers/mapSubListToEmbed";
import {
  MediaForAiring,
  MediaResponse,
  MediaSubbedInfo,
  MediaType,
} from "./types/graphql";

interface SearchCommandOptions {
  query: string;
  type: MediaType;
}
interface SubAddCommandOptions {
  anime: string;
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
    };
  }

  public async setUp(): Promise<void> {
    super.setUp();

    const ani = await getAllAnimeNotifications();

    for (const a of ani) {
      this.checkNotification(a.id);
    }
  }

  private notifyNewEpisode = async (
    animeInfo: MediaResponse<MediaForAiring>,
    episode: number
  ): Promise<void> => {
    this.logger.log(
      "Notifying for new episode",
      animeInfo.Media.title,
      episode
    );

    const embed = mapMediaAiringToNewEpisodeEmbed(
      animeInfo.Media,
      episode
    );
    const subs = await getAllSubscriptionsForAnime(
      animeInfo.Media.id
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

        await sendMessage(channel, userMentions, embed);
      }
    }
  };

  private checkNotification = async (id: number) => {
    this.logger.log("Checking for new episode", id);

    const nextAiring = await getNextAiring(id);
    if (!nextAiring) {
      this.logger.log("deleteAllSubscriptionsForId", id);
      await deleteAllSubscriptionsForId(id);
      return;
    }
    const animeInfo = await searchForAiringScheduleById(id);

    const nextAiringInfo =
      animeInfo.Media.airingSchedule?.edges.find(
        (e) => e.node.id === nextAiring.nextAiring
      );

    if (!nextAiringInfo) {
      this.logger.log(
        "deleteAllSubscriptionsForId",
        nextAiringInfo,
        animeInfo.Media.airingSchedule?.edges,
        nextAiring.nextAiring,
        id
      );
      await deleteAllSubscriptionsForId(id);
      return;
    }

    if (nextAiringInfo.node.timeUntilAiring <= 0) {
      this.notifyNewEpisode(
        animeInfo,
        nextAiringInfo.node.episode
      );

      if (animeInfo.Media.nextAiringEpisode) {
        await setNextAiring(
          id,
          animeInfo.Media.nextAiringEpisode.id!
        );

        if (this.animeNotificationTimer[id]) {
          clearTimeout(this.animeNotificationTimer[id]);
        }

        this.logger.log(
          `Set timeout for ${id} with ${
            animeInfo.Media.nextAiringEpisode
              ?.timeUntilAiring * 1000
          }`
        );
        this.animeNotificationTimer[id] = setTimeout(
          () => this.checkNotification(id),
          animeInfo.Media.nextAiringEpisode
            ?.timeUntilAiring * 1000
        );
      } else {
        this.logger.log("deleteAllSubscriptionsForId", id);
        await deleteAllSubscriptionsForId(id);
      }
    } else {
      if (this.animeNotificationTimer[id]) {
        clearTimeout(this.animeNotificationTimer[id]);
      }
      this.logger.log(
        `Set timeout for ${id} with ${
          nextAiringInfo.node.timeUntilAiring * 1000
        }`
      );
      this.animeNotificationTimer[id] = setTimeout(
        () => this.checkNotification(id),
        nextAiringInfo.node.timeUntilAiring * 1000
      );
    }
  };

  private pageUpdate = async (
    data: discord.embed,
    _page: number,
    _total: number,
    token: string
  ): Promise<void> => {
    const app = getApplication();
    if (app) {
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
    if (app) {
      const { query, type } =
        this.getOptions<SearchCommandOptions>(
          ["query", "type"],
          option.options
        );

      const allData = await (type
        ? searchByQueryAndType(query, type)
        : searchByQuery(query));

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
        const pagination = new Pagination<discord.embed>(
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

  private handleSubAdd: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app) {
      const { anime } =
        this.getOptions<SubAddCommandOptions>(
          ["anime"],
          option.options
        );

      const animeInfo = await searchForAiringSchedule(
        anime
      );

      if (
        !animeInfo ||
        !animeInfo.Media.nextAiringEpisode
      ) {
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
        this.logger.log(
          `Set timeout for ${animeInfo.Media.id} with ${
            nextAiring.timeUntilAiring * 1000
          }`
        );
        this.animeNotificationTimer[animeInfo.Media.id] =
          setTimeout(
            () =>
              this.checkNotification(animeInfo.Media.id),
            nextAiring.timeUntilAiring * 1000
          );
      }

      await addSubscription(
        data.guild_id,
        data.member.user?.id || "",
        animeInfo.Media.id
      );

      await setNextAiring(
        animeInfo.Media.id,
        nextAiring.id!
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

  private handleSubList: CommandHandler = async (
    data,
    _option
  ) => {
    const app = getApplication();
    if (app) {
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

      const animeInfo = await searchForUser(
        subs.map((s) => s.id)
      );
      if (animeInfo.Page.media.length === 0) {
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
        animeInfo.Page.media,
        10
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
    if (app) {
      await editOriginalInteractionResponse(app.id, token, {
        content: "",
        embeds: [mapSubListToEmbed(data, page, total)],
      });
    }
  };
}
