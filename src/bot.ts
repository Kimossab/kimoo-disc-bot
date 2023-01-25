import "dotenv/config";

import AchievementModule from "#/achievement/module";
import AnilistModule from "#/anilist/module";
import BadgesModule from "#/badges/module";
import BirthdayModule from "#/birthday/module";
import FandomModule from "#/fandom/module";
import MiscModule from "#/misc/module";
import VNDBModule from "#/vndb/module";
import SauceAnimeModule from "#sauceAnime/module";
import SauceArtModule from "#sauceArt/module";
import SettingsModule from "#settings/module";

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
    await createInteractionResponse(data.id, data.token, {
      type: InteractionCallbackType.PONG,
    });
    _logger.log("Got Ping");
  }
};

const toggles = {
  BIRTHDAY_MODULE: process.env.BIRTHDAY_MODULE === "true",
  ACHIEVEMENT_MODULE: process.env.ACHIEVEMENT_MODULE === "true",
  BADGES_MODULE: process.env.BADGES_MODULE === "true",
  FANDOM_MODULE: process.env.FANDOM_MODULE === "true",
  SAUCE_MODULE: process.env.SAUCE_MODULE === "true",
  MISC_MODULE: process.env.MISC_MODULE === "true",
  VNDB_MODULE: process.env.VNDB_MODULE === "true",
  ANILIST_MODULE: process.env.ANILIST_MODULE === "true",
};

const modules = [
  new SettingsModule(),
  new BirthdayModule(toggles.BIRTHDAY_MODULE),
  new AchievementModule(toggles.ACHIEVEMENT_MODULE),
  new BadgesModule(toggles.BADGES_MODULE),
  new FandomModule(toggles.FANDOM_MODULE),
  new SauceArtModule(toggles.SAUCE_MODULE),
  new SauceAnimeModule(toggles.SAUCE_MODULE),
  new MiscModule(toggles.MISC_MODULE),
  new VNDBModule(toggles.VNDB_MODULE),
  new AnilistModule(toggles.ANILIST_MODULE),
];

const ready = async () => {
  _logger.log("Discord says Ready");

  const commandNames = modules.filter((m) => m.active).map((m) => m.name);
  for (const module of modules) {
    module.setUp();
  }

  const app = getApplication();
  if (app && app.id) {
    const commandData = await getCommands(app.id);

    if (commandData === null) {
      return;
    }

    const commandsToRemove = commandData.filter(
      (c) => !commandNames.includes(c.name)
    );

    for (const cmd of commandsToRemove) {
      if (cmd.id) {
        _logger.log("Deleting command", cmd);
        deleteCommand(app.id, cmd.id);
      }
    }

    for (const module of modules.filter((m) => m.active)) {
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
  _logger.log("All set");
};

const updateBotPresence = () => {
  socket.randomPresence();

  const time = randomNum(5 * 60 * 1000, 30 * 60 * 1000);
  _logger.log(`updating presence in ${formatSecondsIntoMinutes(time / 1000)}`);
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
    _logger.log(
      `SESSION START LIMIT REACHED (is 0). RESTARTING IN ${gateway.session_start_limit.reset_after}ms`,
      gateway
    );
    setTimeout(main, gateway.session_start_limit.reset_after);
    return;
  }

  const time = randomNum(5 * 60 * 1000, 30 * 60 * 1000);
  _logger.log(`updating presence in ${formatSecondsIntoMinutes(time / 1000)}`);
  setTimeout(updateBotPresence, time);

  _logger.log(
    `${gateway.session_start_limit.remaining}/${gateway.session_start_limit.remaining} sessions available`
  );

  const url = `${gateway.url}/?v=${process.env.API_V}&encoding=json`;
  socket.connect(url);
};

main();
