import { APIInteractionGuildMember } from "discord-api-types/v10";
import { getGuilds } from "@/state/store";
import { getServer } from "@/database";

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
export const interpolator = (
  str: string,
  replace: Record<string, string | number>,
): string => {
  let result = str;
  for (const s in replace) {
    const r = replace[s];

    result = result.replace(`<${s}>`, r.toString());
  }

  return result;
};

export const formatSecondsIntoMinutes = (seconds: number): string => {
  const mins = Math.trunc(seconds / 60);
  const minsString = mins.toString().padStart(2, "0");
  const secs = Math.trunc(seconds % 60);
  const secsString = secs.toString().padStart(2, "0");

  return `${minsString}:${secsString}`;
};

/**
 * Converts a snowflake into a date object
 * @param snowflake Snowflake value
 */
export const snowflakeToDate = (snowflake: string): Date => new Date(Number(snowflake) / 4194304 + 1420070400000);

/**
 * Get a random number between 2 values
 * @param min Minimum value
 * @param max Maximum value (excluded)
 */
export const randomNum = (min: number, max: number): number => Math.floor(Math.random() * (max - min)) + min;

/**
 * Checks if the user is an admin for this server
 * @param server Server id
 * @param member Guild member object
 */
export const checkAdmin = async (
  server?: string,
  member?: APIInteractionGuildMember,
): Promise<boolean> => {
  if (!server || !member) {
    return false;
  }

  const guild = getGuilds().find(g => g.id === server);

  if (!guild || !member.user) {
    return false;
  }

  if (guild.owner_id === member.user.id) {
    return true;
  }

  const role = (await getServer(server))?.adminRole;

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
  dest: string,
): Promise<boolean> => new Promise((resolve) => {
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
  destination: string,
): Promise<boolean> => new Promise((resolve) => {
  fs.rename(source, destination, (err: NodeJS.ErrnoException | null) => {
    resolve(!err);
  });
});

export const deleteFile = async (file: string): Promise<boolean> => new Promise((resolve) => {
  fs.unlink(file, (err: NodeJS.ErrnoException | null) => {
    resolve(!err);
  });
});

export const limitString = (str: string, limit: number, ellipsis = true) => {
  if (str.length > limit) {
    if (ellipsis) {
      return str.slice(0, limit - 4) + " (…)";
    }
    else {
      return str.slice(0, limit);
    }
  }

  return str;
};
