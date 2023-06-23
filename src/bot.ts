import "dotenv/config";

import AnilistModule from "#/anilist/module";
import BirthdayModule from "#/birthday/module";
import MiscModule from "#/misc/module";
import VNDBModule from "#/vndb/module";
import SauceAnimeModule from "#sauceAnime/module";
import SauceArtModule from "#sauceArt/module";
import SettingsModule from "#settings/module";
import VotingModule from "#voting/module";

import {
  createInteractionResponse,
  deleteCommand,
  getCommands,
  getGatewayBot,
  sendMessage,
} from "./discord/rest";
import socket from "./discord/socket";
import { formatSecondsIntoMinutes, randomNum } from "./helper/common";
import mongoConnect from "./helper/database";
import Logger from "./helper/logger";
import {
  getApplication,
  setCommandExecutedCallback,
  setModules,
  setReadyCallback,
} from "./state/store";
import {
  Interaction,
  InteractionCallbackType,
  InteractionType,
} from "./types/discord";

const _logger = new Logger("bot");

let hasStarted = false;

// default command executer
// this is necessary mainly for ping/pong
const commandExecuted = async (data: Interaction) => {
  if (data && data.type === InteractionType.PING) {
    _logger.info("Got Ping");
    await createInteractionResponse(data.id, data.token, {
      type: InteractionCallbackType.PONG,
    });
  }
};

const toggles = {
  BIRTHDAY_MODULE: process.env.BIRTHDAY_MODULE === "true",
  SAUCE_MODULE: process.env.SAUCE_MODULE === "true",
  MISC_MODULE: process.env.MISC_MODULE === "true",
  VNDB_MODULE: process.env.VNDB_MODULE === "true",
  ANILIST_MODULE: process.env.ANILIST_MODULE === "true",
  VOTING_MODULE: process.env.VOTING_MODULE === "true",
};

const modules = [
  new SettingsModule(),
  new BirthdayModule(toggles.BIRTHDAY_MODULE),
  new SauceArtModule(toggles.SAUCE_MODULE),
  new SauceAnimeModule(toggles.SAUCE_MODULE),
  new MiscModule(toggles.MISC_MODULE),
  new VNDBModule(toggles.VNDB_MODULE),
  new AnilistModule(toggles.ANILIST_MODULE),
  new VotingModule(toggles.VOTING_MODULE),
];

const ready = async () => {
  _logger.info("Discord says Ready");

  const activeModules = modules.filter((module) => module.active);

  setModules(activeModules);

  for (const module of activeModules) {
    module.setUp();
  }

  const app = getApplication();
  if (app && app.id) {
    const commandData = await getCommands(app.id);

    if (commandData === null) {
      return;
    }

    const commandNames = activeModules.map((module) => module.cmdName);

    const commandsToRemove = commandData.filter(
      (command) => !commandNames.includes(command.name)
    );

    for (const cmd of commandsToRemove) {
      if (cmd.id) {
        _logger.info("Deleting command", cmd.name);
        deleteCommand(app.id, cmd.id);
      }
    }

    for (const module of activeModules) {
      const existing = commandData.find((c) => c.name === module.name);
      module.upsertCommands(app.id, existing);
    }
  }

  updateBotPresence();

  if (!hasStarted) {
    if (process.env.OWNER_DM_CHANNEL) {
      await sendMessage(process.env.OWNER_DM_CHANNEL, "Bot started");
    }
    hasStarted = true;
  }

  _logger.info("All set");
};

const updateBotPresence = () => {
  socket.randomPresence();

  const time = randomNum(5 * 60 * 1000, 30 * 60 * 1000);
  _logger.info(`updating presence in ${formatSecondsIntoMinutes(time / 1000)}`);
  setTimeout(updateBotPresence, time);
};

const main = async (): Promise<void> => {
  setReadyCallback(ready);
  setCommandExecutedCallback(commandExecuted);

  await mongoConnect(process.env.DATABASE_URL);

  const gateway = await getGatewayBot();
  if (!gateway) {
    process.exit(1);
  }

  if (gateway.session_start_limit.remaining === 0) {
    _logger.info(
      `SESSION START LIMIT REACHED (is 0). RESTARTING IN ${gateway.session_start_limit.reset_after}ms`,
      gateway
    );
    setTimeout(main, gateway.session_start_limit.reset_after);
    return;
  }

  const time = randomNum(5 * 60 * 1000, 30 * 60 * 1000);
  _logger.info(`updating presence in ${formatSecondsIntoMinutes(time / 1000)}`);
  setTimeout(updateBotPresence, time);

  _logger.info(
    `${gateway.session_start_limit.remaining}/${gateway.session_start_limit.remaining} sessions available`
  );

  const url = `${gateway.url}/?v=${process.env.API_V}&encoding=json`;
  socket.connect(url);
};

main();
