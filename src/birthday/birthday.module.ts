import {
  getLastServerBirthdayWishes,
  getServerAnimeChannel,
  getServerBirthdayChannel,
  setServerBirthdayChannel,
  updateServerLastWishes,
} from '../bot/bot.controller';
import { checkAdmin, snowflakeToDate, stringReplacer } from '../helper/common';
import Logger from '../helper/logger';
import {
  getApplication,
  getGuilds,
  setCommandExecutedCallback,
} from '../state/actions';
import messageList from '../helper/messages';
import {
  createInteractionResponse,
  editOriginalInteractionResponse,
  sendMessage,
} from '../discord/rest';
import {
  addBirthday,
  getBirthdays,
  getUserBirthday,
  getBirthdaysByMonth,
  updateLastWishes,
} from './birthday.controller';
import { IBirthday } from './birthday.model';
import { getOption, getOptionValue } from '../helper/modules.helper';
import { interaction_response_type, no_mentions } from '../helper/constants';

const _logger = new Logger('birthday');
let firstSetup: boolean = true;
let checkTimeout: NodeJS.Timeout | null = null;

const handleChannelCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    if (!checkAdmin(data.guild_id, data.member)) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.no_permission,
      });
      return;
    }

    const channel = getOptionValue<string>(option.options, 'channel');

    if (channel) {
      await setServerBirthdayChannel(data.guild_id, channel);
      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.birthday.channel_set_success, {
          channel: `<#${channel}>`,
        }),
      });

      _logger.log(
        `Set anime channel to ${channel} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    } else {
      const ch = await getServerAnimeChannel(data.guild_id);
      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.birthday.servers_channel, {
          channel: `<#${ch}>`,
        }),
      });

      _logger.log(
        `Get anime channel in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  }
};

const handleAddCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    if (!checkAdmin(data.guild_id, data.member)) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.no_permission,
      });
      return;
    }

    const user = getOptionValue<string>(option.options, 'user');
    const day = getOptionValue<number>(option.options, 'day');
    const month = getOptionValue<number>(option.options, 'month');
    const year = getOptionValue<number>(option.options, 'year');

    const bd = await getUserBirthday(data.guild_id, user!);

    if (bd) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.birthday.already_set,
      });
    } else {
      await addBirthday(data.guild_id, user!, day!, month!, year);

      const birthdayString = `${day}/${month}${year ? '/' + year : ''}`;
      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.birthday.set_success, {
          user: `<@${user}>`,
          date: birthdayString,
        }),
      });

      _logger.log(
        `Add user ${user} birthday to ${birthdayString} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  }
};

const handleRemoveCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    if (!checkAdmin(data.guild_id, data.member)) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.no_permission,
      });
      return;
    }

    const user = getOptionValue<string>(option.options, 'user');

    const bd = await getUserBirthday(data.guild_id, user!);

    if (bd) {
      await bd.delete();
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.birthday.remove_success,
      });

      _logger.log(
        `Removed user ${user} birthday in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    } else {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.birthday.not_found,
      });
    }
  }
};

const handleGetCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    const user = getOptionValue<string>(option.options, 'user');
    const month = getOptionValue<number>(option.options, 'month');

    // no permission
    if ((user || month) && !checkAdmin(data.guild_id, data.member)) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.no_permission,
      });
      return;
    }

    // for a user
    if (user) {
      const bd = await getUserBirthday(data.guild_id, user);

      if (bd) {
        const birthdayString = `${bd.day}/${bd.month}${
          bd.year ? '/' + bd.year : ''
        }`;
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.birthday.user, {
            user: `<@${user}>`,
            date: birthdayString,
          }),
          allowed_mentions: no_mentions,
        });

        _logger.log(
          `Birthday for ${user} requested in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
        );
      } else {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.not_found,
        });
      }
    }
    // for a month
    else if (month) {
      const bd = await getBirthdaysByMonth(data.guild_id, month);

      let message = '';

      for (const b of bd) {
        message += `<@${b.user}> - ${b.day}/${b.month}`;
        if (b.year) {
          message += `/${b.year}`;
        }

        message += '\n';
      }

      if (message === '') {
        message = stringReplacer(messageList.birthday.found_zero, {
          month: month,
        });
      }

      await editOriginalInteractionResponse(app.id, data.token, {
        content: message,
        allowed_mentions: no_mentions,
      });

      _logger.log(
        `Birthday for month ${month} requested in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
    //for the user
    else {
      const bd = await getUserBirthday(data.guild_id, data.member.user!.id);

      if (bd) {
        const birthdayString = `${bd.day}/${bd.month}${
          bd.year ? '/' + bd.year : ''
        }`;
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.birthday.user, {
            user: `<@${data.member.user!.id}>`,
            date: birthdayString,
          }),
          allowed_mentions: no_mentions,
        });

        _logger.log(
          `Birthday requested in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
        );
      } else {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.not_found,
        });
      }
    }
  }
};

const handleServerCommand = async (
  data: discord.interaction
): Promise<void> => {
  const app = getApplication();
  if (app) {
    const serverDate = snowflakeToDate(data.guild_id);

    const birthdayString = `${serverDate.getDate()}/${
      serverDate.getMonth() + 1
    }/${serverDate.getFullYear()}`;

    await editOriginalInteractionResponse(app.id, data.token, {
      content: stringReplacer(messageList.birthday.server, {
        date: birthdayString,
      }),
    });

    _logger.log(
      `Get server birthday date in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const commandExecuted = async (data: discord.interaction): Promise<void> => {
  if (data.data && data.data.name === 'birthday' && data.data.options) {
    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge_with_source,
    });

    const channel = getOption(data.data.options, 'channel');
    const add = getOption(data.data.options, 'add');
    const remove = getOption(data.data.options, 'remove');
    const get = getOption(data.data.options, 'get');
    const server = getOption(data.data.options, 'server');

    if (channel) {
      return await handleChannelCommand(data, channel);
    }

    if (add) {
      return await handleAddCommand(data, add);
    }

    if (remove) {
      return await handleRemoveCommand(data, remove);
    }

    if (get) {
      return await handleGetCommand(data, get);
    }

    if (server) {
      return handleServerCommand(data);
    }

    _logger.error(
      'UNKNOWN COMMAND',
      data.data.options[0].name,
      data.data.options[0].options,
      data.data.options[0].value
    );

    const app = getApplication();
    if (app) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.internal_error,
      });
    }
  }
};

const checkBirthdays = async () => {
  _logger.log('Checking birthdays');

  if (checkTimeout) {
    clearTimeout(checkTimeout);
  }

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const servers = getGuilds();

  const serverChannels: string_object<string | null> = {};

  for (const s of servers) {
    const serverDate = snowflakeToDate(s.id);
    serverChannels[s.id] = await getServerBirthdayChannel(s.id);

    if (
      serverChannels[s.id] &&
      serverDate.getDate() == day &&
      serverDate.getMonth() + 1 === month
    ) {
      const lastWishes = await getLastServerBirthdayWishes(s.id);

      if (!lastWishes || lastWishes < year) {
        const message = stringReplacer(messageList.birthday.server_bday, {
          age: (year - serverDate.getFullYear()).toString(),
          name: s.name,
        });

        await sendMessage(serverChannels[s.id]!, message);
        await updateServerLastWishes(s.id);
      }
    }
  }

  const todayBDay = await getBirthdays(day, month, year);
  if (todayBDay.length > 0) {
    _logger.log("Today's birthdays", todayBDay);

    const serverBdays: string_object<IBirthday[]> = {};

    for (const bday of todayBDay) {
      if (serverBdays[bday.server] === undefined) {
        serverBdays[bday.server] = [bday];
      } else {
        serverBdays[bday.server].push(bday);
      }
    }

    for (const server in serverBdays) {
      if (serverChannels[server]) {
        const usersCongratulated: string[] = [];
        if (Object.prototype.hasOwnProperty.call(serverBdays, server)) {
          let message =
            serverBdays[server].length > 1
              ? messageList.birthday.today_bday_s
              : messageList.birthday.today_bday;

          for (const bd of serverBdays[server]) {
            usersCongratulated.push(bd.user);

            message += `\n - <@${bd.user}>`;
            if (bd.year) {
              message += ` (${year - bd.year})`;
            }
          }
          await updateLastWishes(server, usersCongratulated);
          await sendMessage(serverChannels[server]!, message);
        }
      }
    }
  }

  const time =
    1000 -
    milliseconds + //ms to next s
    (60 - seconds) * 1000 + //s to next m
    (60 - minutes - 1) * 60 * 1000 + //m to next h
    ((hours >= 12 ? 24 : 12) - hours - 1) * 60 * 60 * 1000; //h to next 12/24

  _logger.log(`next check in ${time} milliseconds`);

  checkTimeout = setTimeout(checkBirthdays, time);
};

const start = () => {
  checkBirthdays();
};

export const setUp = (): void => {
  start();

  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
