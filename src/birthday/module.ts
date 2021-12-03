import BaseModule from "../base-module";
import {
  getLastServerBirthdayWishes,
  getServerAnimeChannel,
  setServerBirthdayChannel,
  updateServerLastWishes,
} from "../bot/database";
import {
  checkAdmin,
  getDayInfo,
  snowflakeToDate,
  stringReplacer,
} from "../helper/common";
import {
  getApplication,
  getGuilds,
} from "../state/actions";
import {
  addBirthday,
  getBirthdays,
  getBirthdaysByMonth,
  getServersBirthdayChannel,
  getUserBirthday,
  updateLastWishes,
} from "./database";
import messageList from "../helper/messages";
import {
  editOriginalInteractionResponse,
  sendMessage,
} from "../discord/rest";
import { IBirthday } from "./models/birthday.model";
import { no_mentions } from "../helper/constants";

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

type ChannelCommandOptions = ChannelOption;
type AddCommandOptions = DayOption &
  MonthOption &
  YearOption;
type RemoveCommandOptions = UserOption;
type GetCommandOptions = UserOption & MonthOption;

export default class BirthdayModule extends BaseModule {
  private checkTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super("birthday");

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
    };
  }

  private async checkBirthdays() {
    this.logger.log("Checking birthdays");

    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout);
    }

    const {
      hours,
      minutes,
      seconds,
      milliseconds,
      day,
      month,
      year,
    } = getDayInfo();

    const serversData = getGuilds();
    const serverChannels =
      await getServersBirthdayChannel();

    // Server birthdays
    for (const s in serverChannels) {
      const serverDate = snowflakeToDate(s);
      if (
        serverDate.getDate() == day &&
        serverDate.getMonth() + 1 === month
      ) {
        const lastWishes =
          await getLastServerBirthdayWishes(s);
        if (!lastWishes || lastWishes < year) {
          const message = stringReplacer(
            messageList.birthday.server_bday,
            {
              age: (
                year - serverDate.getFullYear()
              ).toString(),
              name:
                serversData.find(
                  (server) => server.id === s
                )?.name || "",
            }
          );
          await sendMessage(serverChannels[s], message);
          await updateServerLastWishes(s);
        }
      }
    }

    // User birthdays
    const todayBirthDays = await getBirthdays(
      day,
      month,
      year
    );
    if (todayBirthDays.length > 0) {
      this.logger.log("Today's birthdays", todayBirthDays);
      const serverBirthdays: string_object<IBirthday[]> =
        {};
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
          }
          await updateLastWishes(
            server,
            usersCongratulated
          );
          await sendMessage(
            serverChannels[server],
            message
          );
        }
      }
    }

    const time =
      1000 -
      milliseconds + // ms to next s
      (60 - seconds) * 1000 + // s to next m
      (60 - minutes - 1) * 60 * 1000 + // m to next h
      ((hours >= 12 ? 24 : 12) - hours - 1) *
        60 *
        60 *
        1000; // h to next 12/24

    this.logger.log(`next check in ${time} milliseconds`);
    this.checkTimeout = setTimeout(
      () => this.checkBirthdays(),
      time
    );
  }

  private handleChannelCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app) {
      const { channel } =
        this.getOptions<ChannelCommandOptions>(
          ["channel"],
          option.options
        );

      if (channel) {
        await setServerBirthdayChannel(
          data.guild_id,
          channel
        );
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: stringReplacer(
              messageList.birthday.channel_set_success,
              {
                channel: `<#${channel}>`,
              }
            ),
          }
        );
        this.logger.log(
          `Set birthday channel to ${channel} in ${data.guild_id} by ` +
            `${data.member.user?.username}#${data.member.user?.discriminator}`
        );
      } else {
        const ch = await getServersBirthdayChannel();
        const channel = ch[data.guild_id];
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: stringReplacer(
              messageList.birthday.servers_channel,
              {
                channel: `<#${channel}>`,
              }
            ),
          }
        );
        this.logger.log(
          `Get birthday channel in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
        );
      }
    }
  };

  private handleAddCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app) {
      const { day, month, year } =
        this.getOptions<AddCommandOptions>(
          ["day", "month", "year"],
          option.options
        );

      const user = data.member.user?.id || "";

      const bd = await getUserBirthday(data.guild_id, user);

      if (bd) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.birthday.already_set,
          }
        );
        return;
      }

      await addBirthday(
        data.guild_id,
        user,
        day || -1,
        month || -1,
        year
      );

      const birthdayString = `${day}/${month}${
        year ? `/${year}` : ""
      }`;
      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: stringReplacer(
            messageList.birthday.set_success,
            {
              user: `<@${user}>`,
              date: birthdayString,
            }
          ),
        }
      );

      this.logger.log(
        `Add user ${user} birthday to ${birthdayString} in ${data.guild_id} by ` +
          `${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private handleRemoveCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app) {
      const isAdmin = await checkAdmin(
        data.guild_id,
        data.member
      );

      let user = data.member.user?.id;

      if (isAdmin) {
        const options =
          this.getOptions<RemoveCommandOptions>(
            ["user"],
            option.options
          );

        user = options.user || user;
      }

      const bd = await getUserBirthday(
        data.guild_id,
        user || ""
      );

      if (bd) {
        await bd.delete();
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.birthday.remove_success,
          }
        );
        this.logger.log(
          `Removed user ${user} birthday in ${data.guild_id} by ` +
            `${data.member.user?.username}#${data.member.user?.discriminator}`
        );
      } else {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.birthday.not_found,
          }
        );
      }
    }
  };

  private async handleGetMonthCommand(
    data: Interaction,
    app: Application,
    month: number
  ): Promise<void> {
    const bd = await getBirthdaysByMonth(
      data.guild_id,
      month
    );

    let message = "";

    for (const b of bd) {
      message += `<@${b.user}> - ${b.day}/${b.month}`;
      if (b.year) {
        message += `/${b.year}`;
      }

      message += "\n";
    }

    if (message === "") {
      message = stringReplacer(
        messageList.birthday.found_zero,
        {
          month,
        }
      );
    }

    await editOriginalInteractionResponse(
      app.id,
      data.token,
      {
        content: message,
        allowed_mentions: no_mentions,
      }
    );

    this.logger.log(
      `Birthday for month ${month} requested in ${data.guild_id} by ` +
        `${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }

  private handleGetCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app) {
      const { user, month } =
        this.getOptions<GetCommandOptions>(
          ["user", "month"],
          option.options
        );

      if (month) {
        return this.handleGetMonthCommand(data, app, month);
      }

      const requestedUser =
        user || data.member.user?.id || "";

      const bd = await getUserBirthday(
        data.guild_id,
        requestedUser
      );

      if (bd) {
        const birthdayString = `${bd.day}/${bd.month}${
          bd.year ? `/${bd.year}` : ""
        }`;
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: stringReplacer(
              messageList.birthday.user,
              {
                user: `<@${requestedUser}>`,
                date: birthdayString,
              }
            ),
            allowed_mentions: no_mentions,
          }
        );
        this.logger.log(
          `Birthday requested in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
        );
      } else {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.birthday.not_found,
          }
        );
      }
    }
  };

  private handleServerCommand: CommandHandler = async (
    data
  ) => {
    const app = getApplication();
    if (app) {
      const serverDate = snowflakeToDate(data.guild_id);
      const birthdayString = `${serverDate.getDate()}/${
        serverDate.getMonth() + 1
      }/${serverDate.getFullYear()}`;
      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: stringReplacer(
            messageList.birthday.server,
            {
              date: birthdayString,
            }
          ),
        }
      );
      this.logger.log(
        `Get server birthday date in ${data.guild_id} by ` +
          `${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  public clear(): void {
    this.checkTimeout && clearTimeout(this.checkTimeout);
  }
}
