import { CommandInfo } from "#base-module";

import Logger from "@/helper/logger";
import { getOption } from "@/helper/modules";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

import { AnimeManager } from "../helpers/anime-manager";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import subAddCommand from "./subAdd.command";
import subListCommand from "./subList.command";

const definition: ApplicationCommandOption = {
  name: "sub",
  description: "Subscriptions commands",
  type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
  options: [],
};

const handler = (subCommands: Record<string, CommandInfo>): CommandHandler => {
  return async (data, option) => {
    for (const cmd of Object.keys(subCommands)) {
      const cmdData = getOption(option.options, cmd);

      if (cmdData) {
        return await subCommands[cmd].handler(data, cmdData);
      }
    }
  };
};

export default (
  logger: Logger,
  rateLimiter: AnilistRateLimit,
  animeList: AnimeManager[],
  removeAnime: (id: number) => void
): CommandInfo => {
  const subCommands: Record<string, CommandInfo> = {
    add: subAddCommand(logger, rateLimiter, animeList, removeAnime),
    list: subListCommand(logger, rateLimiter),
  };

  for (const cmd of Object.keys(subCommands)) {
    definition.options?.push(subCommands[cmd].definition);
  }

  return {
    definition,
    handler: handler(subCommands),
  };
};
