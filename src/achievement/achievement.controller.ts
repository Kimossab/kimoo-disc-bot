import AchievementRank, {
  IAchievementRank,
} from './models/achievement-rank.model';
import Achievement, { IAchievement } from './models/achievement.model';
import UserAchievement, {
  IUserAchievement,
} from './models/user-achievement.model';

const getHighestId = async (server: string): Promise<number> => {
  const ach: IAchievement = await Achievement.findOne({ server }, null, {
    sort: {
      id: -1,
    },
    limit: 1,
  });

  return ach ? ach.id : 0;
};

/**
 * Gets an achievement by server id and name
 * @param server Server Id
 * @param name Achievement name
 * @returns Achievement
 */
export const getAchievement = async (
  server: string,
  name: string
): Promise<IAchievement | null> => {
  return Achievement.findOne({
    server,
    name,
  });
};

export const getAchievementById = async (
  server: string,
  id: number
): Promise<IAchievement | null> => {
  return Achievement.findOne({
    server,
    id,
  });
};

export const getServerAchievements = async (
  server: string
): Promise<IAchievement[]> => {
  return Achievement.find({
    server,
  });
};

/**
 * Creates a new achievement for a server
 * @param server Server id
 * @param name Achievement name
 * @param image Achievement image
 * @param description Achievement description
 */
export const createAchievement = async (
  server: string,
  name: string,
  image: string | null,
  description: string,
  points: number
): Promise<void> => {
  if (!(await getAchievement(server, name))) {
    const ach = new Achievement();
    ach.id = (await getHighestId(server)) + 1;
    ach.server = server;
    ach.name = name;
    ach.image = image;
    ach.description = description;
    ach.points = points;

    await ach.save();
  }
};

export const updateAchievement = async (
  server: string,
  id: number,
  name: string | null,
  image: string | null,
  description: string | null,
  points: number | null
): Promise<IAchievement | null> => {
  const ach = await getAchievementById(server, id);
  if (ach) {
    if (server) {
      ach.server = server;
    }
    if (name) {
      ach.name = name;
    }
    if (image) {
      ach.image = image;
    }
    if (description) {
      ach.description = description;
    }
    if (points) {
      ach.points = points;
    }

    await ach.save();
  }

  return ach;
};

export const deleteAchievement = async (
  server: string,
  id: number
): Promise<void> => {
  const ach = await getAchievementById(server, id);
  if (ach) {
    await ach.delete();
  }
};

// USER ACHIEVEMENTS
export const getUserAchievement = async (
  server: string,
  user: string,
  achievement: IAchievement
): Promise<IUserAchievement | null> => {
  return UserAchievement.findOne({
    server,
    user,
    achievement: achievement._id,
  });
};

export const getAllUserAchievements = async (
  server: string,
  user: string
): Promise<IUserAchievement[]> => {
  return UserAchievement.find({
    server,
    user,
  }).populate('achievement');
};

export const getServerAchievementLeaderboard = async (
  server: string
): Promise<achievement.server_leaderboard[]> => {
  return UserAchievement.aggregate([
    [
      {
        $match: {
          server: server,
        },
      },
      {
        $group: {
          _id: '$user',
          achievement: {
            $push: '$achievement',
          },
        },
      },
      {
        $lookup: {
          from: 'achievements',
          localField: 'achievement',
          foreignField: '_id',
          as: 'achievement',
        },
      },
      {
        $project: {
          _id: 0,
          user: '$_id',
          points: {
            $sum: '$achievement.points',
          },
        },
      },
      {
        $lookup: {
          from: 'achievementranks',
          let: {
            user_points: '$points',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $lte: ['$points', '$$user_points'],
                    },
                    {
                      $eq: ['$server', server],
                    },
                  ],
                },
              },
            },
            {
              $sort: {
                points: -1,
              },
            },
          ],
          as: 'rank',
        },
      },
      {
        $sort: {
          points: -1,
        },
      },
      {
        $project: {
          user: '$user',
          points: '$points',
          rank: {
            $arrayElemAt: ['$rank.name', 0],
          },
        },
      },
    ],
  ]);
};

export const createUserAchievement = async (
  server: string,
  user: string,
  achievement: IAchievement
): Promise<void> => {
  if (!(await getUserAchievement(server, user, achievement))) {
    const uAch = new UserAchievement();
    uAch.user = user;
    uAch.server = server;
    uAch.awardDate = new Date();
    uAch.achievement = achievement;
    await uAch.save();
  }
};

//RANKS
export const getRankByName = async (
  server: string,
  name: string
): Promise<IAchievementRank | null> => {
  return AchievementRank.findOne({
    server,
    name,
  });
};

export const getRankByPoints = async (
  server: string,
  points: number
): Promise<IAchievementRank | null> => {
  return AchievementRank.findOne({
    server,
    points,
  });
};

export const getServerRanks = async (
  server: string
): Promise<IAchievementRank[]> => {
  return AchievementRank.find({
    server,
  });
};

export const createRank = async (
  server: string,
  name: string,
  points: number
): Promise<void> => {
  const rank = new AchievementRank();

  rank.server = server;
  rank.name = name;
  rank.points = points;

  await rank.save();
};

export const deleteRank = async (
  server: string,
  name: string
): Promise<void> => {
  const rank = await getRankByName(server, name);

  if (rank) {
    rank.delete();
  }
};
