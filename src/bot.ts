import dotenv from "dotenv";

dotenv.config();

import {
  getAdminRole,
  setAdminRole,
  getCommandVersion,
  setCommandVersion,
} from "./bot/database";

import {
  createCommand,
  createInteractionResponse,
  deleteCommand,
  getCommands,
  getGatewayBot,
} from "./discord/rest";
import socket from "./discord/socket";
import connect from "./helper/database";
import Logger from "./helper/logger";
import {
  checkAdmin,
  formatSecondsIntoMinutes,
  isValidReactionUser,
  randomNum,
} from "./helper/common";
import {
  getApplication,
  getPagination,
  setCommandExecutedCallback,
  setReactionCallback,
  setReadyCallback,
} from "./state/actions";
import * as commandInfo from "./commands";
import AchievementModule from "./achievement/module";
import BadgesModule from "./badges/module";
import BirthdayModule from "./birthday/module";
import FandomModule from "./fandom/module";
import SauceModule from "./sauce/module";
import MiscModule from "./misc/module";
import VNDBModule from "./vndb/module";
import AnilistModule from "./anilist/module";
import messageList from "./helper/messages";
import {
  Interaction,
  InteractionCallbackType,
  InteractionType,
} from "./types/discord";

const _logger = new Logger("bot");

// default command executer
// this is necessary mainly for ping/pong
const commandExecuted = async (data: Interaction) => {
  if (data && data.type === InteractionType.PING) {
    await createInteractionResponse(data.id, data.token, {
      type: InteractionCallbackType.PONG,
    });
    _logger.log("Got Ping");
  } else if (data && data.data?.name === "settings") {
    const option = data.data.options![0];

    if (
      option.name === "admin_role" &&
      data.member &&
      data.guild_id
    ) {
      if (!checkAdmin(data.guild_id, data.member)) {
        await createInteractionResponse(
          data.id,
          data.token,
          {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: messageList.common.no_permission,
            },
          }
        );
        return;
      }

      const role = option.options?.length
        ? option.options[0]
        : null;

      if (role) {
        await setAdminRole(
          data.guild_id,
          role.value as string
        );
        await createInteractionResponse(
          data.id,
          data.token,
          {
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
          }
        );
      } else {
        const role = await getAdminRole(data.guild_id);
        if (role) {
          await createInteractionResponse(
            data.id,
            data.token,
            {
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
            }
          );
        } else {
          await createInteractionResponse(
            data.id,
            data.token,
            {
              type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content:
                  "This server doesn't have an admin role defined",
              },
            }
          );
        }
      }
    }
  }
};

const birthdayModule = new BirthdayModule();
const achievementModule = new AchievementModule();
const badgesModule = new BadgesModule();
const fandomModule = new FandomModule();
const sauceModule = new SauceModule();
const miscModule = new MiscModule();
const vndbModule = new VNDBModule();
const anilistModule = new AnilistModule();

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

    const commandVersion = await getCommandVersion();

    const commandNames = commandInfo.list.map(
      (c) => c.name
    );

    const commandsToRemove = commandData.filter(
      (c) => !commandNames.includes(c.name)
    );

    for (const cmd of commandsToRemove) {
      if (cmd.id) {
        _logger.log("Deleting command", cmd);
        deleteCommand(app.id, cmd.id!);
      }
    }

    for (const cmd of commandInfo.list) {
      const existing = commandData.filter(
        (c) => c.name === cmd.name
      );

      if (
        !existing.length ||
        commandVersion !== commandInfo.version
      ) {
        _logger.log("Creating command", cmd);
        const nCmd = await createCommand(app.id, cmd);

        if (nCmd) {
          commandData = commandData.filter(
            (c) => c.name !== nCmd.name
          );
        }
      }
    }

    setCommandVersion(commandInfo.version);
  }
  _logger.log("All set");
};

const updateBotPresence = () => {
  socket.randomPresence();

  const time = randomNum(5 * 60 * 1000, 30 * 60 * 1000);
  _logger.log(
    `updating presence in ${formatSecondsIntoMinutes(
      time / 1000
    )}`
  );
  setTimeout(updateBotPresence, time);
};

const main = async (): Promise<void> => {
  setReadyCallback(ready);
  setCommandExecutedCallback(commandExecuted);

  connect(process.env.DATABASE_URL!);

  const gateway = await getGatewayBot();
  if (!gateway) {
    process.exit(1);
  }

  if (gateway.session_start_limit.remaining === 0) {
    _logger.log(
      `SESSION START LIMIT REACHED (is 0). RESTARTING IN ${gateway.session_start_limit.reset_after}ms`,
      gateway
    );
    setTimeout(
      main,
      gateway.session_start_limit.reset_after
    );
    return;
  }

  const time = randomNum(5 * 60 * 1000, 30 * 60 * 1000);
  _logger.log(
    `updating presence in ${formatSecondsIntoMinutes(
      time / 1000
    )}`
  );
  setTimeout(updateBotPresence, time);

  _logger.log(
    `${gateway.session_start_limit.remaining}/${gateway.session_start_limit.remaining} sessions available`
  );

  const url = `${gateway.url}/?v=${process.env.API_V}&encoding=json`;
  socket.connect(url);
};

main();
