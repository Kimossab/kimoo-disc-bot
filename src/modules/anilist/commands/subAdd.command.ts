import { editOriginalInteractionResponse } from "@/discord/rest";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";

import { addSubscription, setNextAiring } from "../database";
import { searchForAiringSchedule } from "../graphql/graphql";
import { AnimeManager } from "../helpers/anime-manager";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import { mapMediaAiringToEmbed } from "../mappers/mapMediaAiringToEmbed";

interface SubAddCommandOptions {
  anime: string;
}
export const subAddCommand = (
  logger: Logger,
  rateLimiter: AnilistRateLimit,
  animeList: AnimeManager[],
  removeAnime: (id: number) => void
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id) {
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

      const nextAiring = animeInfo.Media.nextAiringEpisode;
      const nextAiringInfo = await setNextAiring(
        animeInfo.Media.id,
        nextAiring?.id || null
      );

      if (!animeList.find((anime) => anime.id === animeInfo.Media.id)) {
        const animeManager = new AnimeManager(
          logger,
          rateLimiter,
          nextAiringInfo,
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
