import { CommandInfo } from "#base-module";

import { editOriginalInteractionResponse } from "@/discord/rest";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

import { addSubscription, setAnimeLastAiring } from "../database";
import { searchForAiringSchedule } from "../graphql/graphql";
import { AnimeManager, getLastAndNextEpisode } from "../helpers/anime-manager";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import { mapMediaAiringToEmbed } from "../mappers/mapMediaAiringToEmbed";

interface SubAddCommandOptions {
  anime: string;
}

const definition: ApplicationCommandOption = {
  name: "add",
  description: "Add a subscription",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "anime",
      description: "Anime name",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
};

export const handler = (
  logger: Logger,
  rateLimiter: AnilistRateLimit,
  animeList: AnimeManager[],
  removeAnime: (id: number) => void
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const { anime } = getOptions<SubAddCommandOptions>(
        ["anime"],
        option.options
      );

      const animeInfo = await searchForAiringSchedule(rateLimiter, anime);

      if (!animeInfo) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.anilist.not_found,
        });
        return;
      }

      await addSubscription(
        data.guild_id,
        data.member.user?.id || "",
        animeInfo.Media.id
      );

      const { last } = getLastAndNextEpisode(animeInfo.Media.airingSchedule);

      await setAnimeLastAiring(animeInfo.Media.id, last?.episode);

      if (!animeList.find((anime) => anime.id === animeInfo.Media.id)) {
        const animeManager = new AnimeManager(
          logger,
          rateLimiter,
          animeInfo.Media.id,
          removeAnime
        );
        animeManager.checkNextEpisode();
        animeList.push(animeManager);
      }

      await editOriginalInteractionResponse(app.id, data.token, {
        content: ``,
        embeds: [mapMediaAiringToEmbed(animeInfo.Media)],
      });
    }
  };
};

export default (
  logger: Logger,
  rateLimiter: AnilistRateLimit,
  animeList: AnimeManager[],
  removeAnime: (id: number) => void
): CommandInfo => ({
  definition,
  handler: handler(logger, rateLimiter, animeList, removeAnime),
});
