import prisma from "@/database";
import { ILogger } from "@/helper/logger";
import { AnilistSubscription, LastAiredNotification } from "@prisma/client";

const getSubscription = async (
  server: string,
  user: string,
  id: number
): Promise<AnilistSubscription | null> => await prisma.anilistSubscription.findFirst({
  where: {
    serverId: server,
    user,
    animeId: id
  }
});

export const addSubscription = async (
  server: string,
  user: string,
  id: number
): Promise<void> => {
  if (!await getSubscription(server, user, id)) {
    await prisma.anilistSubscription.create({
      data: {
        serverId: server,
        user,
        animeId: id
      }
    });
  }
};

export const getAllSubscriptionsForAnime = async (id: number): Promise<AnilistSubscription[]> => await prisma.anilistSubscription.findMany({ where: { animeId: id } });

export const deleteAllSubscriptionsForId = async (id: number, logger: ILogger): Promise<void> => {
  await prisma.lastAiredNotification.deleteMany({
    where: { animeId: id }
  });
  logger.info("Subs deleted for anime", {
    id,
    subs: await prisma.anilistSubscription.deleteMany({
      where: {
        animeId: id
      }
    })
  });
};

export const deleteUserSubscriptionForIds = async (
  user: string,
  server: string,
  ids: number[]
): Promise<void> => {
  for (const id of ids) {
    await prisma.anilistSubscription.deleteMany({
      where: {
        user,
        serverId: server,
        animeId: id
      }
    });
  }
};

export const getUserSubs = async (
  server: string,
  user: string
): Promise<AnilistSubscription[]> => await prisma.anilistSubscription.findMany({
  where: {
    serverId: server,
    user
  }
});

export const getAllAnimeLastAiring = async (): Promise<
  LastAiredNotification[]
> => await prisma.lastAiredNotification.findMany();

export const getAnimeLastAiringById = async (id: number): Promise<LastAiredNotification | null> => await prisma.lastAiredNotification.findFirst({ where: { animeId: id } });

export const setAnimeLastAiring = async (
  id: number,
  lastAired?: number
): Promise<LastAiredNotification> => {
  const lastAiredNotification = await prisma.lastAiredNotification.findFirst({
    where: { animeId: id }
  });

  if (lastAiredNotification) {
    return lastAiredNotification;
  }

  return await prisma.lastAiredNotification.create({
    data: {
      animeId: id,
      lastAired: lastAired ?? null,
      lastUpdated: new Date()
    }
  });
};

export const updateAnimeLastAiring = async (
  id: number,
  lastAired: number
): Promise<LastAiredNotification> => {
  const data = await prisma.lastAiredNotification.update({
    where: { animeId: id },
    data: {
      lastAired: lastAired,
      lastUpdated: new Date()
    }
  });
  if (!data) {
    throw new Error(`Unable to update last aired: ${id}`);
  }
  return data;
};
