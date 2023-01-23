import "dotenv/config";

import AchievementModule from "#/achievement/module";
import AnilistModule from "#/anilist/module";
import BadgesModule from "#/badges/module";
import BirthdayModule from "#/birthday/module";
import FandomModule from "#/fandom/module";
import MiscModule from "#/misc/module";
import SauceModule from "#/sauce/module";
import VNDBModule from "#/vndb/module";

import { getAdminRole, setAdminRole } from "./bot/database";
import * as commandInfo from "./commands";
import { compareCommands } from "./commands";
import {
  createCommand,
  createInteractionResponse,
  deleteCommand,
  getCommands,
  getGatewayBot,
  sendMessage,
} from "./discord/rest";
import socket from "./discord/socket";
import {
  checkAdmin,
  formatSecondsIntoMinutes,
  randomNum,
} from "./helper/common";
import mongoConnect from "./helper/database";
import Logger from "./helper/logger";
import messageList from "./helper/messages";
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
  } else if (data && data.data?.name === "settings") {
    if (!data.data.options) {
      throw new Error("Missing options");
    }
    const option = data.data.options[0];

    if (option.name === "admin_role" && data.member && data.guild_id) {
      if (!checkAdmin(data.guild_id, data.member)) {
        await createInteractionResponse(data.id, data.token, {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: messageList.common.no_permission,
          },
        });
        return;
      }

      const role = option.options?.length ? option.options[0] : null;

      if (role) {
        await setAdminRole(data.guild_id, role.value as string);
        await createInteractionResponse(data.id, data.token, {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Admin role set to <@&${role.value}>`,
            allowed_mentions: {
              parse: [],
              roles: [],
              users: [],
              replied_user: false,
            },
          },
        });
      } else {
        const role = await getAdminRole(data.guild_id);
        if (role) {
          await createInteractionResponse(data.id, data.token, {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Admin role is <@&${role}>`,
              allowed_mentions: {
                parse: [],
                roles: [],
                users: [],
                replied_user: false,
              },
            },
          });
        } else {
          await createInteractionResponse(data.id, data.token, {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "This server doesn't have an admin role defined",
            },
          });
        }
      }
    }
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

const birthdayModule = new BirthdayModule(toggles.BIRTHDAY_MODULE);
const achievementModule = new AchievementModule(toggles.ACHIEVEMENT_MODULE);
const badgesModule = new BadgesModule(toggles.BADGES_MODULE);
const fandomModule = new FandomModule(toggles.FANDOM_MODULE);
const sauceModule = new SauceModule(toggles.SAUCE_MODULE);
const miscModule = new MiscModule(toggles.MISC_MODULE);
const vndbModule = new VNDBModule(toggles.VNDB_MODULE);
const anilistModule = new AnilistModule(toggles.ANILIST_MODULE);

const ready = async () => {
  _logger.log("Discord says Ready");

  birthdayModule.setUp();
  achievementModule.setUp();
  badgesModule.setUp();
  fandomModule.setUp();
  sauceModule.setUp();
  miscModule.setUp();
  vndbModule.setUp();
  anilistModule.setUp();

  const app = getApplication();
  if (app && app.id) {
    let commandData = await getCommands(app.id);

    if (commandData === null) {
      return;
    }

    const commandNames = commandInfo.list.map((c) => c.name);

    const commandsToRemove = commandData.filter(
      (c) => !commandNames.includes(c.name)
    );

    for (const cmd of commandsToRemove) {
      if (cmd.id) {
        _logger.log("Deleting command", cmd);
        deleteCommand(app.id, cmd.id);
      }
    }

    for (const cmd of commandInfo.list) {
      const existing = commandData.find((c) => c.name === cmd.name);

      if (!existing || !compareCommands(cmd, existing)) {
        _logger.log("Creating command", cmd);
        const nCmd = await createCommand(app.id, cmd);

        if (nCmd) {
          commandData = commandData.filter((c) => c.name !== nCmd.name);
        }
      }
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
