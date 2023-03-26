import {
  deleteAllSubscriptionsForId,
  deleteUserSubscriptionForIds,
  getAllSubscriptionsForAnime,
  getUserSubs,
} from "#anilist/database";
import { searchForUser } from "#anilist/graphql/graphql";
import { AnilistRateLimit } from "#anilist/helpers/rate-limiter";
import { IAnilistSubscription } from "#anilist/models/AnilistSubscription.model";
import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { chunkArray, limitString } from "@/helper/common";
import Logger from "@/helper/logger";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  Component,
  ComponentCommandHandler,
  ComponentType,
  InteractionCallbackDataFlags,
  InteractionCallbackType,
  SelectOption,
} from "@/types/discord";

const definition: ApplicationCommandOption = {
  name: "remove",
  description: "Removes a subscription",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [],
};

export const handler = (rateLimiter: AnilistRateLimit): CommandHandler => {
  return async (data) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });

      const subs = await getUserSubs(data.guild_id, data.member.user?.id || "");

      if (subs.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: "No subscriptions",
        });

        return;
      }

      const subsChunk = chunkArray<IAnilistSubscription>(subs, 25);

      const animeInfo = [];

      for (const chunk of subsChunk) {
        const info = await searchForUser(
          rateLimiter,
          chunk.map((s) => s.id)
        );
        if (info && info.Page.media.length > 0) {
          animeInfo.push(...info.Page.media);
        }
      }

      const components: Component[] = chunkArray(animeInfo, 25).map(
        (chunk, index) => {
          return {
            type: ComponentType.StringSelect,
            custom_id: `anilist.sub.remove.anime.selected.${index}`,
            options: chunk.map<SelectOption>((a) => ({
              label: limitString(a.title.english || a.title.romaji, 100),
              value: a.id.toString(),
              description: limitString(a.title.romaji, 100),
            })),
            max_values: chunk.length,
            min_values: 1,
            placeholder: "Select an anime to remove",
          };
        }
      );

      await editOriginalInteractionResponse(app.id, data.token, {
        content: "",
        components: [
          {
            type: ComponentType.ActionRow,
            components,
          },
        ],
      });
    }
  };
};

const componentHandler = (
  logger: Logger,
  removeAnime: (id: number) => void
): ComponentCommandHandler => {
  return async (data, subCmd) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const values = data.data?.values?.map(Number) ?? [];

      await deleteUserSubscriptionForIds(
        data.member.user?.id ?? "fakeid",
        data.guild_id,
        values
      );

      for (const animeId of values) {
        const subs = await getAllSubscriptionsForAnime(animeId);

        if (!subs.length) {
          await deleteAllSubscriptionsForId(animeId);
          removeAnime(animeId);
        }
      }

      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.UPDATE_MESSAGE,
        data: {
          content: "success",
          components: [],
        },
      });
    }
  };
};

export default (
  logger: Logger,
  rateLimiter: AnilistRateLimit,
  removeAnime: (id: number) => void
): CommandInfo => ({
  definition,
  handler: handler(rateLimiter),
  componentHandler: componentHandler(logger, removeAnime),
});
