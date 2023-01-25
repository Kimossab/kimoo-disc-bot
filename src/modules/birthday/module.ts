import BaseModule from "#/base-module";

import {
  getLastServerBirthdayWishes,
  updateServerLastWishes,
} from "@/bot/database";
import { addRole, removeRole, sendMessage } from "@/discord/rest";
import { getDayInfo, snowflakeToDate, stringReplacer } from "@/helper/common";
import messageList from "@/helper/messages";
import { getGuilds } from "@/state/store";
import { AvailableLocales } from "@/types/discord";

import addCommand from "./commands/add.command";
import channelCommand from "./commands/channel.command";
import getCommand from "./commands/get.command";
import removeCommand from "./commands/remove.command";
import roleCommand from "./commands/role.command";
import serverCommand from "./commands/server.command";
import {
  getBirthdays,
  getOldBirthdayWithRole,
  getServersBirthdayInfo,
  setBirthdayWithRole,
  updateLastWishes,
} from "./database";
import { IBirthday } from "./models/birthday.model";

export default class BirthdayModule extends BaseModule {
  private checkTimeout: NodeJS.Timeout | null = null;

  constructor(isActive: boolean) {
    super("birthday", isActive);

    if (!isActive) {
      this.logger.log("Module deactivated");
      return;
    }

    this.commandDescription[AvailableLocales.English_US] =
      "Handles the birthdays of the users";

    this.checkBirthdays();

    this.commandList = {
      channel: channelCommand(this.logger),
      add: addCommand(this.logger),
      remove: removeCommand(this.logger),
      get: getCommand(this.logger),
      server: serverCommand(this.logger),
      role: roleCommand(this.logger),
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

  public clear(): void {
    this.checkTimeout && clearTimeout(this.checkTimeout);
  }
}
