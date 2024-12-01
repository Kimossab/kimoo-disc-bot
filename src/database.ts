import {
  CommandHistory,
  Prisma,
  PrismaClient,
  Server,
} from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

export const saveGuild = async (id: string): Promise<void> => {
  const exists = await prisma.server.findFirst({ where: { id } });

  if (!exists) {
    await prisma.server.create({ data: { id } });
  }
};

export const getServer = async (id: string): Promise<Server | null> => await prisma.server.findFirst({ where: { id } });

export const setServerAnimeChannel = async (id: string, channel: string) => await prisma.server.update({
  where: { id },
  data: { animeChannel: channel },
});

export const setServerBirthdayChannel = async (id: string, channel: string) => await prisma.server.update({
  where: { id },
  data: { birthdayChannel: channel },
});

export const setServerBirthdayRole = async (id: string, role: string) => await prisma.server.update({
  where: { id },
  data: { birthdayRole: role },
});

export const updateServerLastWishes = async (id: string) => await prisma.server.update({
  where: { id },
  data: { lastBirthdayWishes: new Date().getFullYear() },
});

export const setAdminRole = async (id: string, role: string) => await prisma.server.update({
  where: { id },
  data: { adminRole: role },
});

export const setServerRoleChannel = async (id: string, channel: string) => await prisma.server.update({
  where: { id },
  data: { roleChannel: channel },
});

export const saveCommandHistory = async (commandHistory: Omit<CommandHistory, "id">) => await prisma.commandHistory.create({
  data: {
    ...commandHistory,
    data: commandHistory.data ?? Prisma.JsonNull,
  },
});
