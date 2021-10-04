import {
  achievementListFixtures,
  rankListFixtures,
  serverLeaderboardFixture,
  userAchievementsFixtures,
} from "./fixtures";
import {
  updateServerAchievementRanksPage,
  updateServerAchievementsPage,
  updateServerLeaderboardPage,
  updateUserAchievementsPage,
} from "./pagination";
import messageList from "../helper/messages";
import { editOriginalInteractionResponse } from "../discord/rest";
import { getApplication } from "../state/actions";

const APPLICATION_ID = "APPLICATION_ID";
const TOKEN = "TOKEN";

jest.mock("../discord/rest");
const mockEditOriginalInteractionResponse =
  editOriginalInteractionResponse as jest.Mock;
jest.mock("../state/actions");
const mockGetApplication = getApplication as jest.Mock;
mockGetApplication.mockReturnValue({
  id: APPLICATION_ID,
});

describe("Achievement Pagination", () => {
  it("user achievement", () => {
    updateUserAchievementsPage(
      userAchievementsFixtures,
      2,
      4,
      TOKEN
    );

    const expectedDescription = `<@123456789>(.|\\n)*${userAchievementsFixtures
      .map((ach) => ach.achievement.name + "(.|\\n)*")
      .join("")}`;
    const expectedDescriptionRegex = new RegExp(
      expectedDescription,
      "m"
    );

    expect(
      mockEditOriginalInteractionResponse
    ).toHaveBeenCalledWith(
      APPLICATION_ID,
      TOKEN,
      expect.objectContaining({
        embeds: [
          expect.objectContaining({
            title:
              messageList.achievements.user_achievements,
            footer: {
              text: "Page 2/4",
            },
            description: expect.stringMatching(
              expectedDescriptionRegex
            ),
          }),
        ],
      })
    );
  });

  it("server achievement", () => {
    updateServerAchievementsPage(
      achievementListFixtures,
      2,
      4,
      TOKEN
    );

    const expectedDescription = `(.|\\n)*${achievementListFixtures
      .map((ach) => ach.name + "(.|\\n)*")
      .join("")}`;
    const expectedDescriptionRegex = new RegExp(
      expectedDescription,
      "m"
    );

    expect(
      mockEditOriginalInteractionResponse
    ).toHaveBeenCalledWith(
      APPLICATION_ID,
      TOKEN,
      expect.objectContaining({
        embeds: [
          expect.objectContaining({
            title:
              messageList.achievements.server_achievements,
            footer: {
              text: "Page 2/4",
            },
            description: expect.stringMatching(
              expectedDescriptionRegex
            ),
          }),
        ],
      })
    );
  });

  it("server ranks", () => {
    updateServerAchievementRanksPage(
      rankListFixtures,
      2,
      4,
      TOKEN
    );

    const expectedDescription = `(.|\\n)*${rankListFixtures
      .map((ach) => ach.name + "(.|\\n)*")
      .join("")}`;
    const expectedDescriptionRegex = new RegExp(
      expectedDescription,
      "m"
    );

    expect(
      mockEditOriginalInteractionResponse
    ).toHaveBeenCalledWith(
      APPLICATION_ID,
      TOKEN,
      expect.objectContaining({
        embeds: [
          expect.objectContaining({
            title:
              messageList.achievements
                .server_achievement_ranks,
            footer: {
              text: "Page 2/4",
            },
            description: expect.stringMatching(
              expectedDescriptionRegex
            ),
          }),
        ],
      })
    );
  });

  it("server leaderboard", () => {
    updateServerLeaderboardPage(
      serverLeaderboardFixture,
      2,
      4,
      TOKEN
    );

    expect(
      mockEditOriginalInteractionResponse
    ).toHaveBeenCalledWith(
      APPLICATION_ID,
      TOKEN,
      expect.objectContaining({
        embeds: [
          expect.objectContaining({
            title:
              messageList.achievements.serverLeaderboard,
            footer: {
              text: "Page 2/4",
            },
            fields: expect.arrayContaining(
              serverLeaderboardFixture.map((l) =>
                expect.objectContaining({
                  value: expect.stringContaining(
                    `${l.rank} - ${l.points}`
                  ),
                })
              )
            ),
          }),
        ],
      })
    );
  });
});
