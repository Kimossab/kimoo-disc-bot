import { TestDB } from "@/helper/mocks/database";

import {
  createAchievement,
  createRank,
  createUserAchievement,
  deleteAchievement,
  deleteRank,
  getAchievement,
  getAchievementById,
  getAllUserAchievements,
  getRankByName,
  getRankByPoints,
  getServerAchievementLeaderboard,
  getServerAchievements,
  getServerRanks,
  getUserAchievement,
  updateAchievement,
} from "./database";
import { achievementListFixtures, rankListFixtures } from "./fixtures";
import { IAchievement } from "./models/achievement.model";
import MongoMemoryServer from "mongodb-memory-server-core";

let mongod: MongoMemoryServer;

describe("Achievement database", () => {
  beforeAll(async () => {
    mongod = await TestDB.connect();
  });

  beforeEach(async () => {
    for (const fix of achievementListFixtures) {
      await createAchievement(
        fix.server,
        fix.name,
        fix.image,
        fix.description,
        fix.points
      );
    }
  });

  afterEach(async () => {
    await TestDB.clearDatabase();
  });

  afterAll(async () => {
    await TestDB.clearDatabase();
    await TestDB.closeDatabase(mongod);
  });

  it("should return the requested achievement by name", async () => {
    const achievement = await getAchievement(
      achievementListFixtures[0].server,
      achievementListFixtures[0].name
    );

    expect(achievement).not.toBeNull();
    expect(achievement?.name).toEqual(achievementListFixtures[0].name);
    expect(achievement?.description).toEqual(
      achievementListFixtures[0].description
    );
    expect(achievement?.id).toEqual(1);
  });

  it("should return the server achievements", async () => {
    const achievements = await getServerAchievements(
      achievementListFixtures[0].server
    );

    expect(achievements.length).toEqual(2);
    expect(achievements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          name: achievementListFixtures[0].name,
        }),
        expect.objectContaining({
          id: 2,
          name: achievementListFixtures[1].name,
        }),
      ])
    );
  });

  it("should update the achievement", async () => {
    const achievement = await getAchievementById(
      achievementListFixtures[0].server,
      1
    );

    expect(achievement).not.toBeNull();
    if (!achievement) {
      throw new Error("achievement is null");
    }
    expect(achievement.name).toMatch(achievementListFixtures[0].name);

    const updatedAchievement = await updateAchievement(
      achievementListFixtures[0].server,
      achievement.id,
      achievement.name + " update",
      "some image url",
      achievement.description + " updated",
      achievement.points + 5
    );
    expect(updatedAchievement).not.toBeNull();
    expect(updatedAchievement?.name).toEqual(
      achievementListFixtures[0].name + " update"
    );
    expect(updatedAchievement?.image).toEqual("some image url");
    expect(updatedAchievement?.description).toEqual(
      achievementListFixtures[0].description + " updated"
    );
    expect(updatedAchievement?.points).toEqual(
      achievementListFixtures[0].points + 5
    );
  });

  it("should delete the achievement", async () => {
    await deleteAchievement(achievementListFixtures[0].server, 1);
    const achievement = await getAchievementById(
      achievementListFixtures[0].server,
      1
    );

    expect(achievement).toBeNull();
  });

  describe("User Achievements", () => {
    const USER_ID = "123";

    let achievement: IAchievement;

    beforeEach(async () => {
      achievement = (await getAchievementById(
        achievementListFixtures[0].server,
        1
      )) as IAchievement;
      await createUserAchievement(
        achievementListFixtures[0].server,
        USER_ID,
        achievement
      );
    });

    it("should add an achievement to a user", async () => {
      const userAchievement = await getUserAchievement(
        achievementListFixtures[0].server,
        USER_ID,
        achievement
      );

      expect(userAchievement).not.toBeNull();
      expect(userAchievement?.user).toEqual(USER_ID);
      expect(userAchievement?.server).toEqual(
        achievementListFixtures[0].server
      );
      expect(userAchievement?.achievement).toEqual(achievement._id);
    });

    it("should get a list of achievements for a user", async () => {
      const achievements = await getAllUserAchievements(
        achievementListFixtures[0].server,
        USER_ID
      );

      expect(achievements.length).toEqual(1);
    });

    it("should get a the server leaderboard", async () => {
      const leaderboard = await getServerAchievementLeaderboard(
        achievementListFixtures[0].server
      );

      expect(leaderboard.length).toEqual(1);
      expect(leaderboard).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            user: USER_ID,
            points: achievementListFixtures[0].points,
          }),
        ])
      );
    });
  });

  describe("Ranks", () => {
    beforeEach(async () => {
      for (const fix of rankListFixtures) {
        await createRank(fix.server, fix.name, fix.points);
      }
    });

    it("should get the rank by name", async () => {
      const rank = await getRankByName(
        rankListFixtures[0].server,
        rankListFixtures[0].name
      );

      expect(rank).toEqual(expect.objectContaining(rankListFixtures[0]));
    });

    it("should get the rank by points", async () => {
      const rank = await getRankByPoints(
        rankListFixtures[1].server,
        rankListFixtures[1].points
      );

      expect(rank).toEqual(expect.objectContaining(rankListFixtures[1]));
    });

    it("should get the server ranks", async () => {
      const ranks = await getServerRanks(rankListFixtures[1].server);

      expect(ranks).toEqual(
        expect.arrayContaining([
          expect.objectContaining(rankListFixtures[0]),
          expect.objectContaining(rankListFixtures[1]),
        ])
      );
    });

    it("should delete without throwing errors", async () => {
      await expect(
        deleteRank(rankListFixtures[0].server, rankListFixtures[0].name)
      ).resolves.not.toThrow();

      const ranks = await getServerRanks(rankListFixtures[0].server);
      expect(ranks.length).toEqual(2);
    });
  });
});
