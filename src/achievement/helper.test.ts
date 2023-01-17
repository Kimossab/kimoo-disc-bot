import { stringReplacer } from "../helper/common";
import messageList from "../helper/messages";
import {
  achievementFixture,
  rankListFixtures,
  userAchievementsFixtures,
} from "./fixtures";
import {
  createAchievementGivenEmbed,
  createAchievementRankProgressEmbed,
  createProgressBar,
  getCurrentAndNextRank,
  getTotalPoints,
} from "./helper";

describe("AchievementHelper", () => {
  describe("getTotalPoints", () => {
    it("should return the correct sum of points", () => {
      expect(getTotalPoints(userAchievementsFixtures)).toEqual(25);
    });

    it("should return 0 points for an empty array", () => {
      expect(getTotalPoints([])).toEqual(0);
    });
  });

  describe("getCurrentAndNextRank", () => {
    it.each([
      [0, null, rankListFixtures[0]],
      [10, rankListFixtures[0], rankListFixtures[1]],
      [25, rankListFixtures[1], rankListFixtures[2]],
      [40, rankListFixtures[2], null],
    ])(
      "should return the correct ranks for %s points",
      (points, current, next) => {
        const result = getCurrentAndNextRank(points, rankListFixtures);
        expect(result.current).toEqual(current);
        expect(result.next).toEqual(next);
      }
    );

    it("should return null for both current and next when there's no ranks", () => {
      const result = getCurrentAndNextRank(25, []);
      expect(result.current).toBeNull();
      expect(result.next).toBeNull();
    });
  });

  describe("createProgressBar", () => {
    it.each([
      [0, 20, 20, "░".repeat(20)],
      [5, 20, 20, "▓".repeat(5) + "░".repeat(15)],
      [20, 20, 20, "▓".repeat(20)],
      [0, 100, 10, "░".repeat(10)],
      [5, 100, 10, "▓" + "░".repeat(9)],
      [90, 100, 10, "▓".repeat(9) + "░"],
      [100, 100, 10, "▓".repeat(10)],
      [0, 20, 40, "░".repeat(40)],
      [5, 20, 40, "▓".repeat(10) + "░".repeat(30)],
      [20, 20, 40, "▓".repeat(40)],
    ])(
      "should render the correct bar for %s/%s in %s steps",
      (value, max, steps, bar) => {
        const prog = createProgressBar(value, max, steps);
        expect(prog).toMatch(bar);
      }
    );
  });

  describe("createAchievementGivenEmbed", () => {
    it("should create a correct discord embed", () => {
      expect(createAchievementGivenEmbed(achievementFixture)).toEqual({
        title: messageList.achievements.new_achievement_awarded,
        description: stringReplacer(
          messageList.achievements.new_achievement_awarded_desc,
          {
            name: achievementFixture.name,
            description: achievementFixture.description,
            points: achievementFixture.points,
          }
        ),
        image: {
          url: achievementFixture.image,
        },
      });
    });
  });

  describe("createAchievementRankProgressEmbed", () => {
    it("should create a correct discord embed", () => {
      expect(
        createAchievementRankProgressEmbed(
          "12345678790",
          25,
          rankListFixtures[1],
          rankListFixtures[2]
        )
      ).toEqual(
        expect.objectContaining({
          title: messageList.achievements.progress,
          description: expect.stringContaining(
            `<@12345678790>\n**Points**: 25\n**Rank**: ${rankListFixtures[1].name}\n**Next Rank**: ${rankListFixtures[2].name} @${rankListFixtures[2].points} points`
          ),
        })
      );
    });
  });
});
