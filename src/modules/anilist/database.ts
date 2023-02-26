import AnilistSubscription, {
  IAnilistSubscription,
} from "./models/AnilistSubscription.model";
import AnimeNotification, {
  IAnimeNotification,
  IAnimeNotificationDocument,
} from "./models/animeNotification.model";
import LastAiredNotification, {
  ILastAiredNotificationDocument,
} from "./models/LastAiredNotification.model";

const getSubscription = async (
  server: string,
  user: string,
  id: number
): Promise<IAnilistSubscription | null> =>
  AnilistSubscription.findOne({
    server,
    user,
    id,
  });

export const addSubscription = async (
  server: string,
  user: string,
  id: number
): Promise<void> => {
  if (!(await getSubscription(server, user, id))) {
    const sub = new AnilistSubscription();
    sub.id = id;
    sub.server = server;
    sub.user = user;
    await sub.save();
  }
};

export const getAllSubscriptionsForAnime = async (
  id: number
): Promise<IAnilistSubscription[]> => AnilistSubscription.find({ id });

export const deleteAllSubscriptionsForId = async (
  id: number
): Promise<void> => {
  await AnilistSubscription.deleteMany({
    id,
  });
  await LastAiredNotification.deleteMany({
    id,
  });
};

export const getUserSubs = async (
  server: string,
  user: string
): Promise<IAnilistSubscription[]> =>
  AnilistSubscription.find({
    server,
    user,
  });

export const getAllAnimeLastAiring = async (): Promise<
  ILastAiredNotificationDocument[]
> => LastAiredNotification.find();

export const setAnimeLastAiring = async (
  id: number,
  lastAired?: number
): Promise<ILastAiredNotificationDocument> => {
  const lastAiredNotif = await LastAiredNotification.findOne({ id });

  if (lastAiredNotif) {
    return lastAiredNotif;
  }

  const animeLastAired = new LastAiredNotification();
  animeLastAired.id = id;
  animeLastAired.lastAired = lastAired || null;
  animeLastAired.lastUpdated = new Date();
  return await animeLastAired.save();
};

export const updateAnimeLastAiring = async (
  id: number,
  lastAired: number
): Promise<ILastAiredNotificationDocument> => {
  const data = await LastAiredNotification.findOneAndUpdate(
    { id },
    {
      lastAired: lastAired,
      lastUpdated: new Date(),
    }
  );
  if (!data) {
    throw new Error(`Unable to update last aired: ${id}`);
  }
  return data;
};

// TEMPORARY
export const getNextAiring = async (
  animeId: number
): Promise<IAnimeNotificationDocument | null> =>
  AnimeNotification.findOne({
    id: animeId,
  });

export const setNextAiring = async (
  animeId: number,
  nextAiring: number | null
): Promise<IAnimeNotification> => {
  const info = await getNextAiring(animeId);

  if (!info) {
    const nextAir = new AnimeNotification();
    nextAir.id = animeId;
    nextAir.nextAiring = nextAiring;
    await nextAir.save();
    return nextAir;
  }

  info.nextAiring = nextAiring;
  await info.save();
  return info;
};

export const getAllAnimeNotifications = async (): Promise<
  IAnimeNotification[]
> => AnimeNotification.find();
