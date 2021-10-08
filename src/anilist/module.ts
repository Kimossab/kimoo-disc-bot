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
} from "./graphql";
import { mapMediaAiringToEmbed } from "./mappers/mapMediaAiringToEmbed";
import { mapMediaAiringToNewEpisodeEmbed } from "./mappers/mapMediaAiringToNewEpisodeEmbed";
import { mapMediaToEmbed } from "./mappers/mapMediaToEmbed";
import { mapSubListToEmbed } from "./mappers/mapSubListToEmbed";
import {
  MediaForAiring,
  MediaSubbedInfo,
  MediaType,
  NextEpisode,
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
    animeInfo: MediaForAiring,
    episode: number
  ): Promise<void> => {
    this.logger.log(
      "Notifying for new episode",
      animeInfo.title,
      episode
    );

    const embed = mapMediaAiringToNewEpisodeEmbed(
      animeInfo,
      episode
    );
    const subs = await getAllSubscriptionsForAnime(
      animeInfo.id
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

  private setCheckNotificationTimer = (
    id: number,
    nextEpisode: NextEpisode
  ) => {
    if (this.animeNotificationTimer[id]) {
      clearTimeout(this.animeNotificationTimer[id]);
    }
    const timeToAir =
      nextEpisode.timeUntilAiring * 1000 > 2000000000
        ? 2000000000
        : nextEpisode.timeUntilAiring * 1000;
    this.logger.log(
      `Set timeout for ${id} with ${timeToAir}`
    );
    this.animeNotificationTimer[id] = setTimeout(
      () => this.checkNotification(id),
      timeToAir
    );
  };

  private setNextEpisodeOrDelete = async (id: number) => {
    const nextEpisode = await getNextAiringEpisode(id);
    if (
      !nextEpisode ||
      !nextEpisode?.Media.nextAiringEpisode
    ) {
      this.logger.log(
        "Nothing found on database - deleteAllSubscriptionsForId",
        id
      );
      // TODO: get next airing info from anilist
      // await deleteAllSubscriptionsForId(id);
      return;
    }

    this.logger.log(
      "Setting next episode in the database",
      id,
      nextEpisode
    );
    await setNextAiring(
      id,
      nextEpisode?.Media.nextAiringEpisode.id || -1
    );
    this.setCheckNotificationTimer(
      id,
      nextEpisode?.Media.nextAiringEpisode
    );
    return;
  };

  private checkNotification = async (id: number) => {
    this.logger.log("Checking for new episode", id);

    // get database info
    const nextAiring = await getNextAiring(id);

    // if there's no info in the database then I can't know if it's a new episode
    if (!nextAiring) {
      this.setNextEpisodeOrDelete(id);
      return;
    }

    const scheduleInfo = await searchByScheduleId(
      nextAiring.nextAiring,
      this.logger
    );

    if (!scheduleInfo) {
      this.logger.log(
        "No info found for that id",
        nextAiring,
        id
      );

      await this.setNextEpisodeOrDelete(id);
      return;
    }

    if (scheduleInfo.AiringSchedule.timeUntilAiring <= 0) {
      this.notifyNewEpisode(
        scheduleInfo.AiringSchedule.media,
        scheduleInfo.AiringSchedule.episode
      );

      if (
        scheduleInfo.AiringSchedule.media.nextAiringEpisode
      ) {
        await setNextAiring(
          id,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          scheduleInfo.AiringSchedule.media
            .nextAiringEpisode.id!
        );

        if (this.animeNotificationTimer[id]) {
          clearTimeout(this.animeNotificationTimer[id]);
        }
        const timeToAir =
          scheduleInfo.AiringSchedule.media
            .nextAiringEpisode?.timeUntilAiring *
            1000 >
          2000000000
            ? 2000000000
            : scheduleInfo.AiringSchedule.media
                .nextAiringEpisode?.timeUntilAiring * 1000;

        this.logger.log(
          `Set timeout for ${id} with ${timeToAir}`
        );
        this.animeNotificationTimer[id] = setTimeout(
          () => this.checkNotification(id),
          timeToAir
        );
      } else {
        this.logger.log(
          "No Next Episode - deleteAllSubscriptionsForId",
          id
        );
        // await deleteAllSubscriptionsForId(id);
      }
    } else {
      this.setCheckNotificationTimer(
        id,
        scheduleInfo.AiringSchedule
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
        anime,
        this.logger
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
        const timeToAir =
          nextAiring.timeUntilAiring * 1000 > 2000000000
            ? 2000000000
            : nextAiring.timeUntilAiring * 1000;
        this.logger.log(
          `Set timeout for ${animeInfo.Media.id} with ${timeToAir}`
        );
        this.animeNotificationTimer[animeInfo.Media.id] =
          setTimeout(
            () =>
              this.checkNotification(animeInfo.Media.id),
            timeToAir
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
        subs.map((s) => s.id),
        this.logger
      );
      if (!animeInfo || animeInfo.Page.media.length === 0) {
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
