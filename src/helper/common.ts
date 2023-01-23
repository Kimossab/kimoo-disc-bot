import { getAdminRole } from "@/bot/database";
import { getGuilds } from "@/state/store";
import {
  GuildMember,
  MessageReactionAdd,
  MessageReactionRemove,
} from "@/types/discord";

import fs from "fs";
import https from "https";

export enum string_constants {
  endpoint_wrong_response = "Wrong reply from `<endpoint>`",
}

/**
 * Replaces placeholders between <> with a string
 * @param str Original string
 * @param replace Object with the replaces
 */
export const stringReplacer = (
  str: string,
  replace: Record<string, string | number>
): string => {
  let result = str;
  for (const s in replace) {
    const r = replace[s];

    result = result.replace(`<${s}>`, r.toString());
  }

  return result;
};

/**
 * Checks if the user that reacted is a bot or an actual user
 * @param data Message reaction data
 * @param remove Is the reaction a removal
 */
export const isValidReactionUser = (
  data: MessageReactionAdd | MessageReactionRemove,
  remove: boolean
): boolean => {
  if (remove) {
    return true;
  }

  const d: MessageReactionAdd = data as MessageReactionAdd;
  return !!(d.member && d.member.user && !d.member.user.bot);
};

/**
 * Converts a value in seconds into a string of MM:SS
 * @param seconds Time in seconds
 */
export const formatSecondsIntoMinutes = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const minsString = mins < 10 ? `0${mins}` : mins.toString();
  const secs = Math.trunc(seconds % 60);
  const secsString = secs < 10 ? `0${secs}` : secs.toString();

  return `${minsString}:${secsString}`;
};

/**
 * Converts a snowflake into a date object
 * @param snowflake Snowflake value
 */
export const snowflakeToDate = (snowflake: string): Date =>
  new Date(Number(snowflake) / 4194304 + 1420070400000);

/**
 * Get a random number between 2 values
 * @param min Minimum value
 * @param max Maximum value (excluded)
 */
export const randomNum = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min)) + min;

/**
 * Checks if the user is an admin for this server
 * @param server Server id
 * @param member Guild member object
 */
export const checkAdmin = async (
  server?: string,
  member?: GuildMember
): Promise<boolean> => {
  if (!server || !member) {
    return false;
  }

  const guild = getGuilds().find((g) => g.id === server);

  if (!guild || !member.user) {
    return false;
  }

  if (guild.owner_id === member.user.id) {
    return true;
  }

  const role = await getAdminRole(server);

  if (!role) {
    return false;
  }

  return member.roles.includes(role);
};

export const chunkArray = <T>(data: T[], size: number): T[][] => {
  const R = [];
  for (let i = 0; i < data.length; i += size) {
    R.push(data.slice(i, i + size));
  }
  return R;
};

export const getDayInfo = (day = new Date()): DayInfo => ({
  year: day.getFullYear(),
  month: day.getMonth() + 1,
  day: day.getDate(),
  hours: day.getHours(),
  minutes: day.getMinutes(),
  seconds: day.getSeconds(),
  milliseconds: day.getMilliseconds(),
});

export const downloadFile = async (
  url: string,
  dest: string
): Promise<boolean> =>
  new Promise((resolve) => {
    const file = fs.createWriteStream(dest);

    https
      .get(url, (response) => {
        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve(true);
        });
      })
      .on("error", () => {
        fs.unlink(dest, () => {
          resolve(false);
        });
      });
  });

export const moveFile = async (
  source: string,
  destination: string
): Promise<boolean> =>
  new Promise((resolve) => {
    fs.rename(source, destination, (err: NodeJS.ErrnoException | null) => {
      resolve(!err);
    });
  });

export const deleteFile = async (file: string): Promise<boolean> =>
  new Promise((resolve) => {
    fs.unlink(file, (err: NodeJS.ErrnoException | null) => {
      resolve(!err);
    });
  });
