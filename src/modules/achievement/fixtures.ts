import { IAchievement } from "./models/achievement.model";
import { IAchievementRank } from "./models/achievement-rank.model";
import { IUserAchievement } from "./models/user-achievement.model";

export const userAchievementsFixtures = [
  {
    user: "123456789",
    achievement: {
      points: 20,
      name: "Achievement 1",
    },
    awardDate: new Date(),
  },
  {
    user: "123456789",
    achievement: {
      points: 3,
      name: "Achievement 2",
    },
    awardDate: new Date(),
  },
  {
    user: "123456789",
    achievement: {
      points: 2,
      name: "Achievement 3",
    },
    awardDate: new Date(),
  },
] as IUserAchievement[];

export const rankListFixtures = [
  {
    server: "123456",
    points: 5,
    name: "Rank 1",
  },
  {
    server: "123456",
    points: 20,
    name: "Rank 2",
  },
  {
    server: "123456",
    points: 40,
    name: "Rank 3",
  },
] as IAchievementRank[];

export const achievementFixture = {
  id: 1,
  name: "Test Achievement",
  description: "Some Test Achievement Description",
  image: "some random image",
  server: "some random server",
  points: 25,
} as IAchievement;

export const achievementListFixtures = [
  {
    id: 1,
    server: "123456",
    name: "Test achievement 1",
    description: "Test achievement description one",
    image: null,
    points: 25,
  },
  {
    id: 2,
    server: "123456",
    name: "Test achievement 2",
    description: "Test achievement description two",
    image: null,
    points: 35,
  },
] as IAchievement[];

export const serverLeaderboardFixture = [
  {
    user: "user1",
    points: 20,
    rank: "rank1",
  },
  {
    user: "user2",
    points: 20,
    rank: "rank2",
  },
  {
    user: "user3",
    points: 20,
    rank: "rank3",
  },
] as achievement.serverLeaderboard[];
