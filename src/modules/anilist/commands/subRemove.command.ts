import {
  deleteAllSubscriptionsForId,
  deleteUserSubscriptionForIds,
  getAllSubscriptionsForAnime,
  getUserSubs
} from "#anilist/database";
import { searchForUser } from "#anilist/graphql/graphql";
import { AnilistRateLimit, RequestStatus } from "#anilist/helpers/rate-limiter";
import { CommandHandler, CommandInfo, ComponentCommandHandler } from "#base-module";
import {
  createInteractionResponse,
  editOriginalInteractionResponse,
  sendMessage
} from "@/discord/rest";
import { chunkArray, limitString } from "@/helper/common";
import Logger from "@/helper/logger";
import { getApplication } from "@/state/store";
import { APIApplicationCommandOption, APIMessageStringSelectInteractionData, APIStringSelectComponent, ApplicationCommandOptionType, ComponentType, InteractionResponseType, MessageFlags } from "discord-api-types/v10";

const definition: APIApplicationCommandOption = {
  name: "remove",
  description: "Removes a subscription",
  type: ApplicationCommandOptionType.Subcommand,
  options: []
};

export const handler = (rateLimiter: AnilistRateLimit): CommandHandler => {
  return async (data) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      await createInteractionResponse(
        data.id,
        data.token,
        {
          type: InteractionResponseType.DeferredChannelMessageWithSource,
          data: {
            flags: MessageFlags.Ephemeral
          }
        }
      );

      const subs = await getUserSubs(data.guild_id, data.member.user?.id || "");

      if (subs.length === 0) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: "No subscriptions"
          }
        );

        return;
      }

      const subsChunk = chunkArray(
        subs,
        25
      );

      const animeInfo = [];

      for (const chunk of subsChunk) {
        const info = await searchForUser(rateLimiter, chunk.map((s) => s.animeId));
        if (
          info.status === RequestStatus.OK &&
          info.data.Page.media.length > 0
        ) {
          animeInfo.push(...info.data.Page.media);
        }
      }


      const components: APIStringSelectComponent[] = chunkArray(animeInfo, 25)
        .map((chunk, index) => {
          return {
            type: ComponentType.StringSelect,
            custom_id: `anilist.sub.remove.anime.selected.${index}`,
            options: chunk.map((a) => ({
              label: limitString(
                a.title.english || a.title.romaji,
                100
              ),
              value: a.id.toString(),
              description: limitString(
                a.title.romaji,
                100
              )
            })),
            max_values: chunk.length,
            min_values: 1,
            placeholder: "Select an anime to remove"
          };
        });

      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: "",
          components: [
            {
              type: ComponentType.ActionRow,
              components
            }
          ]
        }
      );
    }
  };
};

const componentHandler = (_logger: Logger, removeAnime: (id: number) => void): ComponentCommandHandler => {
  return async (data) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const values =
        (data.data as APIMessageStringSelectInteractionData)?.values?.map(Number) ??
        [];

      await deleteUserSubscriptionForIds(
        data.member.user?.id ?? "fakeid",
        data.guild_id,
        values
      );

      for (const animeId of values) {
        const subs = await getAllSubscriptionsForAnime(animeId);

        if (!subs.length) {
          if (process.env.OWNER_DM_CHANNEL) {
            await sendMessage(
              process.env.OWNER_DM_CHANNEL,
              `Deleting anilist - no more subs - ${animeId}`
            );
          }
          await deleteAllSubscriptionsForId(animeId, _logger);
          removeAnime(animeId);
        }
      }

      await createInteractionResponse(
        data.id,
        data.token,
        {
          type: InteractionResponseType.UpdateMessage,
          data: {
            content: "success",
            components: []
          }
        }
      );
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
  componentHandler: componentHandler(
    logger,
    removeAnime
  )
});
