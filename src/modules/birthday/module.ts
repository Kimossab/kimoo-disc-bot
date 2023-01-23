import BaseModule from "#/base-module";

import {
  getLastServerBirthdayWishes,
  getServerBirthdayRole,
  setServerBirthdayChannel,
  setServerBirthdayRole,
  updateServerLastWishes,
} from "@/bot/database";
import {
  addRole,
  editOriginalInteractionResponse,
  removeRole,
  sendMessage,
} from "@/discord/rest";
import {
  checkAdmin,
  getDayInfo,
  snowflakeToDate,
  stringReplacer,
} from "@/helper/common";
import { no_mentions } from "@/helper/constants";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication, getGuilds } from "@/state/store";
import { Application, CommandHandler, Interaction } from "@/types/discord";

import {
  addBirthday,
  getBirthdays,
  getBirthdaysByMonth,
  getOldBirthdayWithRole,
  getServersBirthdayInfo,
  getUserBirthday,
  setBirthdayWithRole,
  updateLastWishes,
} from "./database";
import { IBirthday } from "./models/birthday.model";

interface ChannelOption {
  channel: string;
}
interface UserOption {
  user: string;
}
interface DayOption {
  day: number;
}
interface MonthOption {
  month: number;
}
interface YearOption {
  year: number;
}
interface RoleOption {
  role: string;
}

type ChannelCommandOptions = ChannelOption;
type AddCommandOptions = DayOption & MonthOption & YearOption;
type RemoveCommandOptions = UserOption;
type GetCommandOptions = UserOption & MonthOption;
type RoleCommandOptions = RoleOption;

export default class BirthdayModule extends BaseModule {
  private checkTimeout: NodeJS.Timeout | null = null;

  constructor(isActive: boolean) {
    super("birthday", isActive);

    if (!isActive) {
      this.logger.log("Module deactivated");
      return;
    }

    this.checkBirthdays();

    this.commandList = {
      channel: {
        handler: this.handleChannelCommand,
        isAdmin: true,
      },
      add: {
        handler: this.handleAddCommand,
      },
      remove: {
        handler: this.handleRemoveCommand,
      },
      get: {
        handler: this.handleGetCommand,
      },
      server: {
        handler: this.handleServerCommand,
      },
      role: {
        handler: this.handleRoleCommand,
      },
    };
  }

  private async checkBirthdays() {
    this.logger.log("Checking birthdays");

    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout);
    }

    const { hours, minutes, seconds, milliseconds, day, month, year } =
      getDayInfo();

    const serversData = getGuilds();
    const serverChannels = await getServersBirthdayInfo();

    // Server birthday
    for (const s in serverChannels) {
      const serverDate = snowflakeToDate(s);
      if (serverDate.getDate() == day && serverDate.getMonth() + 1 === month) {
        const lastWishes = await getLastServerBirthdayWishes(s);
        if (!lastWishes || lastWishes < year) {
          const message = stringReplacer(messageList.birthday.server_bday, {
            age: (year - serverDate.getFullYear()).toString(),
            name: serversData.find((server) => server.id === s)?.name || "",
          });
          await sendMessage(serverChannels[s].channel, message);
          await updateServerLastWishes(s);
        }
      }
    }

    // User birthdays
    const todayBirthDays = await getBirthdays(day, month, year);

    const rolesToRemove = await getOldBirthdayWithRole(day, month);

    this.logger.log("Roles to Remove", rolesToRemove);

    for (const toRemove of rolesToRemove) {
      if (serverChannels[toRemove.server].role) {
        for (const user of toRemove.users) {
          await removeRole(
            toRemove.server,
            user,
            serverChannels[toRemove.server].role,
            "Birthday Over"
          );
        }
      }
      await toRemove.delete();
    }

    if (todayBirthDays.length > 0) {
      this.logger.log("Today's birthdays", todayBirthDays);

      const serverBirthdays: Record<string, IBirthday[]> = {};

      for (const birthday of todayBirthDays) {
        if (!serverBirthdays[birthday.server]) {
          serverBirthdays[birthday.server] = [birthday];
        } else {
          serverBirthdays[birthday.server].push(birthday);
        }
      }

      for (const server in serverBirthdays) {
        if (serverChannels[server]) {
          const usersCongratulated: string[] = [];
          let message =
            serverBirthdays[server].length > 1
              ? messageList.birthday.today_bday_s
              : messageList.birthday.today_bday;

          for (const bd of serverBirthdays[server]) {
            usersCongratulated.push(bd.user);
            message += `\n - <@${bd.user}>`;
            if (bd.year) {
              message += ` (${year - bd.year})`;
            }

            await addRole(
              server,
              bd.user,
              serverChannels[server].role,
              "Birthday"
            );
          }

          await setBirthdayWithRole(day, month, usersCongratulated, server);

          await updateLastWishes(server, usersCongratulated);
          await sendMessage(serverChannels[server].channel, message);
        }
      }
    }

    const time =
      1000 -
      milliseconds + // ms to next s
      (60 - seconds) * 1000 + // s to next m
      (60 - minutes - 1) * 60 * 1000 + // m to next h
      ((hours >= 12 ? 24 : 12) - hours - 1) * 60 * 60 * 1000; // h to next 12/24

    this.logger.log(`next check in ${time} milliseconds`);
    this.checkTimeout = setTimeout(() => this.checkBirthdays(), time);
  }

  private handleChannelCommand: CommandHandler = async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      const { channel } = getOptions<ChannelCommandOptions>(
        ["channel"],
        option.options
      );

      if (channel) {
        await setServerBirthdayChannel(data.guild_id, channel);
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.birthday.channel_set_success, {
            channel: `<#${channel}>`,
          }),
        });
        this.logger.log(
          `Set birthday channel to ${channel} in ${data.guild_id} by ` +
            `${(data.member || data).user?.username}#${
              (data.member || data).user?.discriminator
            }`
        );
      } else {
        const ch = await getServersBirthdayInfo();
        const { channel } = ch[data.guild_id];
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.birthday.servers_channel, {
            channel: `<#${channel}>`,
          }),
        });
        this.logger.log(
          `Get birthday channel in ${data.guild_id} by ${
            (data.member || data).user?.username
          }#${(data.member || data).user?.discriminator}`
        );
      }
    }
  };

  private handleAddCommand: CommandHandler = async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      const { day, month, year } = getOptions<AddCommandOptions>(
        ["day", "month", "year"],
        option.options
      );

      const user = (data.member || data).user?.id || "";

      const bd = await getUserBirthday(data.guild_id, user);

      if (bd) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.already_set,
        });
        return;
      }

      await addBirthday(data.guild_id, user, day || -1, month || -1, year);

      const birthdayString = `${day}/${month}${year ? `/${year}` : ""}`;
      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.birthday.set_success, {
          user: `<@${user}>`,
          date: birthdayString,
        }),
      });

      this.logger.log(
        `Add user ${user} birthday to ${birthdayString} in ${data.guild_id} by ` +
          `${(data.member || data).user?.username}#${
            (data.member || data).user?.discriminator
          }`
      );
    }
  };

  private handleRemoveCommand: CommandHandler = async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const isAdmin = await checkAdmin(data.guild_id, data.member);

      let user = (data.member || data).user?.id;

      if (isAdmin) {
        const options = getOptions<RemoveCommandOptions>(
          ["user"],
          option.options
        );

        user = options.user || user;
      }

      const bd = await getUserBirthday(data.guild_id, user || "");

      if (bd) {
        await bd.delete();
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.remove_success,
        });
        this.logger.log(
          `Removed user ${user} birthday in ${data.guild_id} by ` +
            `${(data.member || data).user?.username}#${
              (data.member || data).user?.discriminator
            }`
        );
      } else {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.not_found,
        });
      }
    }
  };

  private async handleGetMonthCommand(
    data: Interaction,
    app: Partial<Application>,
    month: number
  ): Promise<void> {
    if (!data.guild_id) {
      return Promise.resolve();
    }

    const bd = await getBirthdaysByMonth(data.guild_id, month);

    let message = "";

    for (const b of bd) {
      message += `<@${b.user}> - ${b.day}/${b.month}`;
      if (b.year) {
        message += `/${b.year}`;
      }

      message += "\n";
    }

    if (message === "") {
      message = stringReplacer(messageList.birthday.found_zero, {
        month,
      });
    }

    await editOriginalInteractionResponse(app.id || "", data.token, {
      content: message,
      allowed_mentions: no_mentions,
    });

    this.logger.log(
      `Birthday for month ${month} requested in ${data.guild_id} by ` +
        `${data.member?.user?.username}#${data.member?.user?.discriminator}`
    );
  }

  private handleGetCommand: CommandHandler = async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      const { user, month } = getOptions<GetCommandOptions>(
        ["user", "month"],
        option.options
      );

      if (month) {
        return this.handleGetMonthCommand(data, app, month);
      }

      const requestedUser = user || (data.member || data).user?.id || "";

      const bd = await getUserBirthday(data.guild_id, requestedUser);

      if (bd) {
        const birthdayString = `${bd.day}/${bd.month}${
          bd.year ? `/${bd.year}` : ""
        }`;
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.birthday.user, {
            user: `<@${requestedUser}>`,
            date: birthdayString,
          }),
          allowed_mentions: no_mentions,
        });
        this.logger.log(
          `Birthday requested in ${data.guild_id} by ${
            (data.member || data).user?.username
          }#${(data.member || data).user?.discriminator}`
        );
      } else {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.birthday.not_found,
        });
      }
    }
  };

  private handleServerCommand: CommandHandler = async (data) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      const serverDate = snowflakeToDate(data.guild_id);
      const birthdayString = `${serverDate.getDate()}/${
        serverDate.getMonth() + 1
      }/${serverDate.getFullYear()}`;
      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.birthday.server, {
          date: birthdayString,
        }),
      });
      this.logger.log(
        `Get server birthday date in ${data.guild_id} by ` +
          `${(data.member || data).user?.username}#${
            (data.member || data).user?.discriminator
          }`
      );
    }
  };

  private handleRoleCommand: CommandHandler = async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      const { role } = getOptions<RoleCommandOptions>(["role"], option.options);

      if (role) {
        await setServerBirthdayRole(data.guild_id, role);
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.birthday.set_role, {
            role: `<@&${role}>`,
          }),
          allowed_mentions: no_mentions,
        });
        this.logger.log(
          `Set birthday role ${role} in ${data.guild_id} by ${
            (data.member || data).user?.username
          }#${(data.member || data).user?.discriminator}`
        );
      } else {
        const role = await getServerBirthdayRole(data.guild_id);
        if (role) {
          await editOriginalInteractionResponse(app.id, data.token, {
            content: stringReplacer(messageList.birthday.server_role, {
              role: `<@&${role}>`,
            }),
            allowed_mentions: no_mentions,
          });
        } else {
          await editOriginalInteractionResponse(app.id, data.token, {
            content: messageList.birthday.role_not_found,
            allowed_mentions: no_mentions,
          });
        }
        this.logger.log(
          `Get birthday role in ${data.guild_id} by ${
            (data.member || data).user?.username
          }#${(data.member || data).user?.discriminator}`
        );
      }
    }
  };

  public clear(): void {
    this.checkTimeout && clearTimeout(this.checkTimeout);
  }
}
