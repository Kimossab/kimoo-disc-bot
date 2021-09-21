import dotenv from 'dotenv';
import {
  getAdminRole,
  setAdminRole,
  getCommandVersion,
  setCommandVersion,
} from './bot/bot.controller';
dotenv.config();

import {
  createCommand,
  createInteractionResponse,
  deleteCommand,
  getCommands,
  getGatewayBot,
} from './discord/rest';
import socket from './discord/socket';
import connect from './helper/database';
import Logger from './helper/logger';
import {
  checkAdmin,
  formatSecondsIntoMinutes,
  isValidReactionUser,
  randomNum,
} from './helper/common';
import {
  getApplication,
  getPagination,
  setCommandExecutedCallback,
  setReactionCallback,
  setReadyCallback,
} from './state/actions';
import * as commandInfo from './commands';
import { interaction_response_type } from './helper/constants';
import * as Sauce from './sauce/sauce.module';
import * as Birthday from './birthday/birthday.module';
import * as Mal from './mal/mal.module';
import * as Livechart from './livechart/livechart.module';
import * as Fandom from './fandom/fandom.module';
import * as Misc from './misc/misc.module';
import * as Achievement from './achievement/achievement.module';
import * as VNDB from './vndb/vndb.module';
import * as Badges from './badges/badges.module';
import messageList from './helper/messages';

const _logger = new Logger('bot');

const commandExecuted = async (data: discord.interaction) => {
  if (data && data.type === 1) {
    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.pong,
    });
    _logger.log('Got Ping');
    return;
  } else if (data && data.data?.name === 'settings') {
    const option = data.data.options![0];
    if (option.name === 'admin_role') {
      if (!checkAdmin(data.guild_id, data.member)) {
        await createInteractionResponse(data.id, data.token, {
          type: interaction_response_type.channel_message_with_source,
          data: {
            content: messageList.common.no_permission,
          },
        });
        return;
      }

      const role = option.options?.length ? option.options[0] : null;

      if (role) {
        await setAdminRole(data.guild_id, role.value);
        await createInteractionResponse(data.id, data.token, {
          type: interaction_response_type.channel_message_with_source,
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
            type: interaction_response_type.channel_message_with_source,
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
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: `This server doesn't have an admin role defined`,
            },
          });
        }
      }
    }
  }
};

const reactionAdded = async (
  data: discord.message_reaction_add | discord.message_reaction_remove,
  remove: boolean
): Promise<void> => {
  if (isValidReactionUser(data, remove)) {
    const pag = getPagination(data.message_id);

    if (pag) {
      switch (data.emoji.name) {
        case '◀':
          pag.previous();
          break;
        case '▶':
          pag.next();
          break;
      }
    }
  }
};

const ready = async () => {
  _logger.log('Discord says Ready');

  Sauce.setUp();
  Birthday.setUp();
  Mal.setUp();
  Livechart.setUp();
  Fandom.setUp();
  Misc.SetUp();
  Achievement.setUp();
  VNDB.setUp();
  Badges.setUp();

  const app = getApplication();
  if (app) {
    let commandData = await getCommands(app.id);
    if (commandData === null) {
      return;
    }

    const commandVersion = await getCommandVersion();

    const commandNames = commandInfo.list.map((c) => c.name);

    const commandsToRemove = commandData.filter(
      (c) => !commandNames.includes(c.name)
    );

    for (const cmd of commandsToRemove) {
      if (cmd.id) {
        _logger.log('Deleting command', cmd);
        deleteCommand(app.id, cmd.id!);
      }
    }

    for (const cmd of commandInfo.list) {
      const existing = commandData.filter((c) => c.name === cmd.name);

      if (!existing.length || commandVersion !== commandInfo.version) {
        _logger.log('Creating command', cmd);
        const nCmd = await createCommand(app.id, cmd);

        if (nCmd) {
          commandData = commandData.filter((c) => c.name !== nCmd.name);
        }
      }
    }

    setCommandVersion(commandInfo.version);
  }
  _logger.log('All set');
};

const updateBotPresence = () => {
  socket.randomPresence();

  const time = randomNum(5 * 60 * 1000, 30 * 60 * 1000);
  _logger.log(`updating presence in ${formatSecondsIntoMinutes(time / 1000)}`);
  setTimeout(updateBotPresence, time);
};

const main = async () => {
  setReadyCallback(ready);
  setCommandExecutedCallback(commandExecuted);
  setReactionCallback(reactionAdded);

  connect(process.env.DATABASE_URL!);

  const gateway = await getGatewayBot();
  if (!gateway) {
    process.exit(1);
  }

  if (gateway.session_start_limit.remaining === 0) {
    return setTimeout(main, gateway.session_start_limit.reset_after);
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
