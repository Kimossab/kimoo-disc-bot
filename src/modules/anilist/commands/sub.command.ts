import { CommandInfo } from "#base-module";

import Logger from "@/helper/logger";
import { getOption } from "@/helper/modules";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  ComponentCommandHandler,
} from "@/types/discord";

import { AnimeManager } from "../helpers/anime-manager";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import subAddCommand from "./subAdd.command";
import subListCommand from "./subList.command";
import subRemoveCommand from "./subRemove.command";

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
const componentHandler = (
  logger: Logger,
  subCommands: Record<string, CommandInfo>
): ComponentCommandHandler => {
  return async (data, subCmd) => {
    for (const cmd of Object.keys(subCommands)) {
      if (subCmd[0] === cmd) {
        const command = subCommands[cmd];

        if (!command.componentHandler) {
          logger.error("Unexpected Component", data);
          return;
        }

        return await command.componentHandler(data, subCmd.slice(1));
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
    remove: subRemoveCommand(logger, rateLimiter, removeAnime),
    list: subListCommand(logger, rateLimiter),
  };

  for (const cmd of Object.keys(subCommands)) {
    definition.options?.push(subCommands[cmd].definition);
  }

  return {
    definition,
    handler: handler(subCommands),
    componentHandler: componentHandler(logger, subCommands),
  };
};
