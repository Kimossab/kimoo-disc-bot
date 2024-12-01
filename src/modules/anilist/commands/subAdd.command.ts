import { CommandHandler, CommandInfo } from "#base-module";

import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "discord-api-types/v10";
import { AnilistRateLimit, RequestStatus } from "../helpers/rate-limiter";
import { AnimeManager, getLastAndNextEpisode } from "../helpers/anime-manager";
import { addSubscription, setAnimeLastAiring } from "../database";
import { createInteractionResponse, editOriginalInteractionResponse } from "@/discord/rest";
import { getApplication } from "@/state/store";
import { getOptions } from "@/helper/modules";
import { mapMediaAiringToEmbed } from "../mappers/mapMediaAiringToEmbed";
import { searchForAiringSchedule } from "../graphql/graphql";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";

interface SubAddCommandOptions {
  anime: string;
}

const definition: APIApplicationCommandOption = {
  name: "add",
  description: "Add a subscription",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "anime",
      description: "Anime name",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export const handler = (
  logger: Logger,
  rateLimiter: AnilistRateLimit,
  animeList: AnimeManager[],
  removeAnime: (id: number) => void,
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      await createInteractionResponse(data.id, data.token, { type: InteractionResponseType.DeferredChannelMessageWithSource });

      const { anime } = getOptions<SubAddCommandOptions>(
        ["anime"],
        option.options,
      );

      const animeInfo = await searchForAiringSchedule(rateLimiter, anime);

      if (animeInfo.status !== RequestStatus.OK) {
        await editOriginalInteractionResponse(app.id, data.token, { content: messageList.anilist.not_found });
        return;
      }

      await addSubscription(
        data.guild_id,
        data.member.user?.id || "",
        animeInfo.data.Media.id,
      );

      const { last } = getLastAndNextEpisode(animeInfo.data.Media.airingSchedule);

      await setAnimeLastAiring(animeInfo.data.Media.id, last?.episode);

      if (!animeList.find(anime => anime.id === animeInfo.data.Media.id)) {
        const animeManager = new AnimeManager(
          logger,
          rateLimiter,
          animeInfo.data.Media.id,
          removeAnime,
        );
        animeManager.checkNextEpisode();
        animeList.push(animeManager);
      }

      await editOriginalInteractionResponse(app.id, data.token, {
        content: "",
        embeds: [mapMediaAiringToEmbed(animeInfo.data.Media)],
      });
    }
  };
};

export default (
  logger: Logger,
  rateLimiter: AnilistRateLimit,
  animeList: AnimeManager[],
  removeAnime: (id: number) => void,
): CommandInfo => ({
  definition,
  handler: handler(logger, rateLimiter, animeList, removeAnime),
});
