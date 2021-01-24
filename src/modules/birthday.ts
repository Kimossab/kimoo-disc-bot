import {
  addBirthday,
  getBirthdays,
  getBirthdaysByMonth,
  getUserBirthday,
  updateLastWishes,
} from "../controllers/birthday.controller";
import {
  getServerBirthdayChannel,
  getLastServerBirthdayWishes,
  setServerBirthdayChannel,
  updateServerLastWishes,
  getServerAnimeChannel,
} from "../controllers/bot.controller";
import { createInteractionResponse, sendMessage } from "../discord/rest";
import { checkAdmin, snowflakeToDate, stringReplacer } from "../helper/common";
import Logger from "../helper/logger";
import { IBirthday } from "../models/birthday.model";
import { getGuilds, setCommandExecutedCallback } from "../state/actions";
import { interaction_response_type, no_mentions } from "../helper/constants";
import messageList from "../helper/messages";

const _logger = new Logger("birthday");

let checkTimeout: NodeJS.Timeout | null = null;
let firstSetup: boolean = true;

const checkBirthdays = async () => {
  _logger.log("Checking birthdays");

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
    milliseconds +
    (60 - seconds + 1) * 1000 +
    (60 - minutes + 1) * 60 * 1000 +
    ((hours > 12 ? 24 : 12) - hours + 1) * 60 * 60 * 1000;

  _logger.log(`next check in ${time} milliseconds`);

  checkTimeout = setInterval(checkBirthdays, time);
};

const start = () => {
  checkBirthdays();
};

const commandExecuted = async (data: discord.interaction) => {
  if (data.data && data.data.name === "birthday" && data.data.options) {
    switch (data.data.options[0].name) {
      case "channel": {
        if (!checkAdmin(data.guild_id, data.member)) {
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: messageList.common.no_permission,
            },
          });
          return;
        }

        const opt = data.data.options[0].options;
        const channel = opt?.find((o) => o.name === "channel");

        if (channel) {
          await setServerBirthdayChannel(data.guild_id, channel.value);
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: stringReplacer(
                messageList.birthday.channel_set_success,
                {
                  channel: `<#${channel.value}>`,
                }
              ),
            },
          });

          _logger.log(
            `Set anime channel to ${channel.value} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
          );
        } else {
          const ch = await getServerAnimeChannel(data.guild_id);
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: stringReplacer(messageList.birthday.servers_channel, {
                channel: `<#${ch}>`,
              }),
            },
          });

          _logger.log(
            `Get anime channel in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
          );
        }

        break;
      }
      case "add": {
        if (!checkAdmin(data.guild_id, data.member)) {
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: messageList.common.no_permission,
            },
          });
          return;
        }

        const user = data.data.options[0].options!.filter(
          (o) => o.name === "user"
        )[0];
        const day = data.data.options[0].options!.filter(
          (o) => o.name === "day"
        )[0];
        const month = data.data.options[0].options!.filter(
          (o) => o.name === "month"
        )[0];
        const yearArray = data.data.options[0].options!.filter(
          (o) => o.name === "year"
        );

        const bd = await getUserBirthday(data.guild_id, user.value!);

        if (bd) {
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: messageList.birthday.already_set,
            },
          });
        } else {
          await addBirthday(
            data.guild_id,
            user.value!,
            day.value!,
            month.value!,
            yearArray.length > 0 ? yearArray[0].value! : null
          );

          const ch = data.data.options[0].options![0].value;
          await setServerBirthdayChannel(data.guild_id, ch);
          const birthdayString = `${day.value!}/${month.value!}${
            yearArray.length > 0 ? "/" + yearArray[0].value! : ""
          }`;
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: stringReplacer(messageList.birthday.set_success, {
                user: `<@${user.value!}>`,
                date: birthdayString,
              }),
            },
          });

          _logger.log(
            `Add user ${user.value!} birthday to ${birthdayString} in ${
              data.guild_id
            } by ${data.member.user?.username}#${
              data.member.user?.discriminator
            }`
          );
        }
        break;
      }
      case "remove": {
        if (!checkAdmin(data.guild_id, data.member)) {
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: messageList.common.no_permission,
            },
          });
          return;
        }

        const user = data.data.options[0].options![0].value!;

        const bd = await getUserBirthday(data.guild_id, user);

        if (bd) {
          await bd.delete();
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: messageList.birthday.remove_success,
            },
          });

          _logger.log(
            `Removed user ${user} birthday in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
          );
        } else {
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: messageList.birthday.not_found,
            },
          });
        }
        break;
      }
      case "get": {
        const opt = data.data.options[0].options;
        const user = opt?.find((o) => o.name === "user");
        const month = opt?.find((o) => o.name === "month");

        // no permission
        if ((user || month) && !checkAdmin(data.guild_id, data.member)) {
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: messageList.common.no_permission,
            },
          });
          return;
        }

        // for a user
        if (user) {
          const bd = await getUserBirthday(data.guild_id, user.value);

          if (bd) {
            const birthdayString = `${bd.day}/${bd.month}${
              bd.year ? "/" + bd.year : ""
            }`;
            createInteractionResponse(data.id, data.token, {
              type: interaction_response_type.channel_message_with_source,
              data: {
                content: stringReplacer(messageList.birthday.user, {
                  user: `<@${user.value}>`,
                  date: birthdayString,
                }),
                allowed_mentions: no_mentions,
              },
            });

            _logger.log(
              `Birthday for ${user} requested in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
            );
          } else {
            createInteractionResponse(data.id, data.token, {
              type: interaction_response_type.channel_message_with_source,
              data: {
                content: messageList.birthday.not_found,
              },
            });
          }
        }
        // for a month
        else if (month) {
          const bd = await getBirthdaysByMonth(data.guild_id, month.value);

          let message = "";

          for (const b of bd) {
            message += `<@${b.user}> - ${b.day}/${b.month}`;
            if (b.year) {
              message += `/${b.year}`;
            }

            message += "\n";
          }

          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: message,
            },
          });

          _logger.log(
            `Birthday for month ${month.value} requested in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
          );
        }
        //for the user
        else {
          const bd = await getUserBirthday(data.guild_id, data.member.user!.id);

          if (bd) {
            const birthdayString = `${bd.day}/${bd.month}${
              bd.year ? "/" + bd.year : ""
            }`;
            createInteractionResponse(data.id, data.token, {
              type: interaction_response_type.channel_message_with_source,
              data: {
                content: stringReplacer(messageList.birthday.user, {
                  user: `<@${data.member.user!.id}>`,
                  date: birthdayString,
                }),
                allowed_mentions: no_mentions,
              },
            });

            _logger.log(
              `Birthday requested in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
            );
          } else {
            createInteractionResponse(data.id, data.token, {
              type: interaction_response_type.channel_message_with_source,
              data: {
                content: messageList.birthday.not_found,
              },
            });
          }
        }
        break;
      }
      case "server": {
        const serverDate = snowflakeToDate(data.guild_id);

        const birthdayString = `${serverDate.getDate()}/${
          serverDate.getMonth() + 1
        }/${serverDate.getFullYear()}`;

        createInteractionResponse(data.id, data.token, {
          type: interaction_response_type.channel_message_with_source,
          data: {
            content: stringReplacer(messageList.birthday.server, {
              date: birthdayString,
            }),
          },
        });
      }
      default:
        _logger.error(
          "UNKNOWN COMMAND",
          data.data.options[0].name,
          data.data.options[0].options,
          data.data.options[0].value
        );
    }
  }
};

export const setUp = () => {
  start();

  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
