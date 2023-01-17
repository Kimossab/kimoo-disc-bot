import Logger from "@/helper/logger";
import { getOption } from "@/helper/modules";

import { AnimeManager } from "../helpers/anime-manager";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import { subAddCommand } from "./subAdd.command";
import { subListCommand } from "./subList.command";

export const subCommand = (
  logger: Logger,
  rateLimiter: AnilistRateLimit,
  animeList: AnimeManager[],
  removeAnime: (id: number) => void
): CommandHandler => {
  const subCommands: Record<string, CommandHandler> = {
    add: subAddCommand(logger, rateLimiter, animeList, removeAnime),
    list: subListCommand(logger, rateLimiter),
  };

  return async (data, option) => {
    for (const cmd of Object.keys(subCommands)) {
      const cmdData = getOption(option.options, cmd);

      if (cmdData) {
        return await subCommands[cmd](data, cmdData);
      }
    }
  };
};
