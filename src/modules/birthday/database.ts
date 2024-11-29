import prisma from "@/database";
import { Birthday } from "@prisma/client";

export const addBirthday = async (
  server: string,
  user: string,
  day: number,
  month: number,
  year: number | null
): Promise<void> => {
  if (!await getUserBirthday(server, user)) {
    await prisma.birthday.create({
      data: {
        serverId: server,
        user,
        day,
        month,
        year
      }
    });
  }
};

export const getBirthdays = async (
  day: number,
  month: number,
  year: number
): Promise<Birthday[]> => {
  const list = await prisma.birthday.findMany({
    where: {
      day,
      month,
      OR: [{ lastWishes: null }, { lastWishes: { lte: year } }]
    }
  });

  return list;
};

export const getUserBirthday = async (
  server: string,
  user: string
): Promise<Nullable<Birthday>> => await prisma.birthday.findFirst({
  where: {
    serverId: server,
    user
  }
});

export const deleteUserBirthday = async (id: string) => await prisma.birthday.delete({ where: { id } });

export const getBirthdaysByMonth = async (
  server: string,
  month: number
): Promise<Birthday[]> => await prisma.birthday.findMany({
  where: {
    serverId: server,
    month
  }
});

export const updateLastWishes = async (
  server: string,
  users: string[]
): Promise<void> => {
  await prisma.birthday.updateMany({
    where: {
      serverId: server,
      user: { in: users }
    },
    data: { lastWishes: new Date().getFullYear() }
  });
};

interface ServersBirthdayInfo {
  channel: string;
  role: string;
}

export const getServersBirthdayInfo = async (): Promise<
  Record<string, ServersBirthdayInfo>
> => {
  const serverChannels = await prisma.server.findMany({
    select: {
      birthdayChannel: true,
      birthdayRole: true,
      id: true
    },
    where: {
      birthdayChannel: { not: null }
    }
  });

  return serverChannels.reduce<Record<string, ServersBirthdayInfo>>(
    (accumulator, value) => {
      accumulator[value.id] = {
        channel: value.birthdayChannel!,
        role: value.birthdayRole!
      };
      return accumulator;
    },
    {}
  );
};

export const setBirthdayWithRole = async (
  day: number,
  month: number,
  users: string[],
  server: string
): Promise<void> => {
  await prisma.birthdayWithRole.create({
    data: {
      serverId: server,
      day,
      month,
      birthdayWithRoleUsers: {
        create: users.map((user) => ({
          user
        }))
      }
    }
  });
};

export const getOldBirthdayWithRole = async (day: number, month: number) => {
  return await prisma.birthdayWithRole.findMany({
    where: { OR: [{ day: { not: day } }, { month: { not: month } }] },
    include: {
      birthdayWithRoleUsers: true
    }
  });
};

export const removeBirthdayWithRole = async (id: string) => {
  return await prisma.birthdayWithRole.delete({ where: { id } });
};
