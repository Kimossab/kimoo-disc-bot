import { CommandInfo } from "#base-module";

import Logger from "@/helper/logger";
import { getOption } from "@/helper/modules";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

import listServerCommand from "./listServer.command";
import listUserCommand from "./listUser.command";

const definition: ApplicationCommandOption = {
  name: "list",
  description: "Lists achievements",
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
    server: listServerCommand(logger),
    user: listUserCommand(logger),
  };
  for (const cmd of Object.keys(subCommands)) {
    definition.options?.push(subCommands[cmd].definition);
  }

  return {
    definition,
    handler: handler(logger, subCommands),
  };
};
