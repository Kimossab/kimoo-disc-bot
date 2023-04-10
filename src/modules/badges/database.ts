import Badge, { IBadge } from "./models/badges.model";
import UserBadge, { IUserBadge } from "./models/user-badge.model";

export const createBadge = async (
  name: string,
  server: string,
  fileExtension: string
): Promise<Nullable<IBadge>> => {
  if (!(await checkName(name, server))) {
    const badge = new Badge();
    badge.name = name;
    badge.server = server;
    badge.fileExtension = fileExtension;
    return await badge.save();
  }

  return null;
};

export const getByName = async (
  name: string,
  server: string
): Promise<IBadge | null> =>
  await Badge.findOne({
    name,
    server,
  });

export const checkName = async (
  name: string,
  server: string
): Promise<boolean> => {
  const badge = await getByName(name, server);

  return !!badge;
};

export const getAllBadges = async (server: string): Promise<IBadge[]> =>
  await Badge.find({
    server,
  });
export const getAllUserBadges = async (
  user: string,
  server: string
): Promise<{ _id: string; badges: IBadge[] }[]> =>
  await UserBadge.aggregate([
    {
      $match: {
        user,
        server,
      },
    },
    {
      $group: {
        _id: "$user",
        badges: {
          $push: "$badge",
        },
      },
    },
    {
      $lookup: {
        from: "badges",
        localField: "badges",
        foreignField: "_id",
        as: "badges",
      },
    },
  ]);

export const giveBadge = async (
  badge: IBadge,
  user: string,
  server: string
): Promise<IUserBadge | null> => {
  if (await checkBadgeUser(badge, user, server)) {
    return null;
  }

  const userBadge = new UserBadge();
  userBadge.badge = badge;
  userBadge.user = user;
  userBadge.server = server;
  userBadge.awardDate = new Date();

  return userBadge.save();
};

export const checkBadgeUser = async (
  badge: IBadge,
  user: string,
  server: string
): Promise<boolean> => {
  const userHasBadge = await UserBadge.findOne({
    server,
    user,
    badge: badge._id,
  });
  return userHasBadge !== null;
};

export const deleteBadge = async (badgeName: string, server: string) => {
  const badge = await Badge.findOne({
    name: badgeName,
    server,
  });

  if (!badge) {
    return null;
  }

  await UserBadge.deleteMany({
    badge: badge._id,
    server,
  });

  await Badge.deleteOne({
    server: badge.server,
    name: badge.name,
  });

  return badge;
};
