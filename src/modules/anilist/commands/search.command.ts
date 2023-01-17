import { editOriginalInteractionResponse } from "@/discord/rest";
import {
  CreatePageCallback,
  InteractionPagination,
} from "@/helper/interaction-pagination";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { addPagination, getApplication } from "@/state/store";
import { Embed } from "@/types/discord";

import { searchByQuery, searchByQueryAndType } from "../graphql/graphql";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import { mapMediaToEmbed } from "../mappers/mapMediaToEmbed";
import { MediaType } from "../types/graphql";

interface SearchCommandOptions {
  query: string;
  type: MediaType;
}

const pageUpdate: CreatePageCallback<Embed> = async (_page, _total, data) => ({
  data: {
    embeds: [data],
  },
});

export const searchCommand = (
  logger: Logger,
  rateLimiter: AnilistRateLimit
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id) {
      const { query, type } = getOptions<SearchCommandOptions>(
        ["query", "type"],
        option.options
      );

      const allData = await (type
        ? searchByQueryAndType(rateLimiter, query, type)
        : searchByQuery(rateLimiter, query));

      if (!allData) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.anilist.not_found,
        });
        return;
      }

      const embedList = mapMediaToEmbed(allData);

      if (embedList.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.anilist.not_found,
        });
        return;
      }

      const pagination = new InteractionPagination(
        app.id,
        embedList,
        pageUpdate
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);

      logger.log(
        `Search Anime ${query} (${type}) in ${data.guild_id} by ` +
          `${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };
};
