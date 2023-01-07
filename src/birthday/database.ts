import serverSettingsModel from "../bot/server-settings.model";
import BirthdayWithRole, {
  IBirthdayWithRole,
} from "./models/birthday-with-role.model";
import Birthday, {
  IBirthday,
} from "./models/birthday.model";

/**
 * Adds a new birthday to the database
 * @param server Server id where the birthday is being added
 * @param user User whose birthday is being added
 * @param day Day of the birthday
 * @param month Month of the birthday
 * @param year Year of the birthday
 */
export const addBirthday = async (
  server: string,
  user: string,
  day: number,
  month: number,
  year: number | null
): Promise<void> => {
  if (!(await getUserBirthday(server, user))) {
    const bd = new Birthday();
    bd.server = server;
    bd.user = user;
    bd.day = day;
    bd.month = month;
    bd.year = year;
    bd.lastWishes = null;
    await bd.save();
  }
};

/**
 * Searches in the database for all birthdays that are today and weren't given an happy birthday yet
 * @param day Day to find birthday
 * @param month Month to find birthday
 * @param year Year to check if a happy birthday was already wished
 */
export const getBirthdays = async (
  day: number,
  month: number,
  year: number
): Promise<IBirthday[]> => {
  const list = await Birthday.find({
    day,
    month,
    $or: [
      { lastWishes: null },
      { lastWishes: { $lt: year } },
    ],
  });

  return list;
};

/**
 * Gets a birthday for a specific user in a server
 * @param server Server where to look for
 * @param user User to get the birthday
 */
export const getUserBirthday = async (
  server: string,
  user: string
): Promise<Nullable<IBirthday>> =>
  await Birthday.findOne({
    server,
    user,
  });

/**
 * Gets the birthday of a month in a server
 * @param server Server where to look for
 * @param user User to get the birthday
 */
export const getBirthdaysByMonth = async (
  server: string,
  month: number
): Promise<IBirthday[]> =>
  await Birthday.find({
    server,
    month,
  });

/**
 * Updates the year of the last time the users were wished a happy birthday to prevent wishing more than once
 * @param server Server where birthdays were posted
 * @param users List of user ids with the users that received a happy birthday
 */
export const updateLastWishes = async (
  server: string,
  users: string[]
): Promise<void> => {
  await Birthday.updateMany(
    {
      server,
      user: { $in: users },
    },
    { lastWishes: new Date().getFullYear() }
  );
};

interface ServersBirthdayInfo {
  channel: string;
  role: string;
}

export const getServersBirthdayInfo = async (): Promise<
  Record<string, ServersBirthdayInfo>
> => {
  const serverChannels =
    await serverSettingsModel.aggregate<{
      server: string;
      channel: string;
      role: string;
    }>([
      {
        $match: {
          birthdayChannel: {
            $ne: null,
          },
        },
      },
      {
        $project: {
          _id: 0,
          server: "$serverId",
          channel: "$birthdayChannel",
          role: "$birthdayRole",
        },
      },
    ]);

  return serverChannels.reduce<
    Record<string, ServersBirthdayInfo>
  >((accumulator, value) => {
    accumulator[value.server] = {
      channel: value.channel,
      role: value.role,
    };
    return accumulator;
  }, {});
};

export const setBirthdayWithRole = async (
  day: number,
  month: number,
  users: string[],
  server: string
): Promise<void> => {
  const bd = new BirthdayWithRole();
  bd.server = server;
  bd.users = users;
  bd.day = day;
  bd.month = month;

  console.log(bd, users);
  await bd.save();
};

export const getOldBirthdayWithRole = async (
  day: number,
  month: number
): Promise<IBirthdayWithRole[]> => {
  return await BirthdayWithRole.find({
    $or: [{ day: { $ne: day } }, { month: { $ne: month } }],
  });
};
