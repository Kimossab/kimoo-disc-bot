import { CommandInfo } from "#base-module";

import Logger from "@/helper/logger";
import { getOption } from "@/helper/modules";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

import rankCreateCommand from "./rankCreate.command";
import rankDeleteCommand from "./rankDelete.command";
import rankLeaderboardCommand from "./rankLeaderboard.command";
import rankListCommand from "./rankList.command";
import rankUserCommand from "./rankUser.command";

const definition: ApplicationCommandOption = {
  name: "rank",
  description: "Server achievement ranks",
  type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
  options: [],
};

const handler = (
  logger: Logger,
  subCommands: Record<string, CommandInfo>
): CommandHandler => {
  return async (data, option) => {
    for (const cmd of Object.keys(subCommands)) {
      const cmdData = getOption(option.options, cmd);

      if (cmdData) {
        return await subCommands[cmd].handler(data, cmdData);
      }
    }
  };
};

export default (logger: Logger): CommandInfo => {
  const subCommands: Record<string, CommandInfo> = {
    list: rankListCommand(logger),
    user: rankUserCommand(),
    leaderboard: rankLeaderboardCommand(logger),
    create: rankCreateCommand(logger),
    delete: rankDeleteCommand(logger),
  };

  for (const cmd of Object.keys(subCommands)) {
    definition.options?.push(subCommands[cmd].definition);
  }

  return {
    definition,
    handler: handler(logger, subCommands),
  };
};
