import { getGuilds } from "../state/actions";
import { getAdminRole } from "../controllers/bot.controller";

export enum string_constants {
  endpoint_wrong_response = "Wrong reply from `<endpoint>`"
}

/**
 * Replaces placeholders between <> with a string
 * @param str Original string
 * @param replace Object with the replaces
 */
export const stringReplacer = (
  str: string,
  replace: string_object<string | number>
) => {
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
  data: discord.message_reaction_add | discord.message_reaction_remove,
  remove: boolean
): boolean => {
  if (remove) {
    return true;
  }

  const d: discord.message_reaction_add = data as discord.message_reaction_add;
  return !!(d.member && d.member.user && !d.member.user.bot);
};

/**
 * Converts a value in seconds into a string of MM:SS
 * @param seconds Time in seconds
 */
export const formatSecondsIntoMinutes = (seconds: number): string => {
  let mins = Math.floor(seconds / 60);
  let minsString = mins < 10 ? `0${mins}` : mins.toString();
  const secs = Math.trunc(seconds % 60);
  let secsString = secs < 10 ? `0${secs}` : secs.toString();

  return `${minsString}:${secsString}`;
};

/**
 * Converts a snowflake into a date object
 * @param snowflake Snowflake value
 */
export const snowflakeToDate = (snowflake: string): Date => {
  return new Date(Number(snowflake) / 4194304 + 1420070400000);
};

/**
 * Get a random number between 2 values
 * @param min Minimum value
 * @param max Maximum value (excluded)
 */
export const randomNum = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Checks if the user is an admin for this server
 * @param server Server id
 * @param member Guild member object
 */
export const checkAdmin = async (
  server: string,
  member: discord.guild_member
): Promise<boolean> => {
  const guild = getGuilds().find(g => g.id === server);

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
  for (var i = 0; i < data.length; i += size) {
    R.push(data.slice(i, i + size));
  }
  return R;
};
