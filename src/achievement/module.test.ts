import { editOriginalInteractionResponse } from "../discord/rest";
import {
  addPagination,
  getApplication,
  setCommandExecutedCallback,
} from "../state/actions";
import AchievementModule from "./module";
import messageList from "../helper/messages";
import Logger from "../helper/logger";
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
import {
  achievementFixture,
  achievementListFixtures,
  rankListFixtures,
  serverLeaderboardFixture,
  userAchievementsFixtures,
} from "./fixtures";
import {
  checkAdmin,
  stringReplacer,
} from "../helper/common";
import { no_mentions } from "../helper/constants";
import { Interaction } from "../types/discord";
import { InteractionPagination } from "../helper/interaction-pagination";

const MODULE_NAME = "achievements";
const APPLICATION_ID = "APPLICATION_ID";
const COMMAND_ID = "COMMAND_ID";
const TOKEN = "TOKEN";
const GUILD_ID = "GUILD_ID";
const USER_ID = "USER_ID";

const CREATE_ACHIEVEMENT_VALUES = {
  name: "test_name",
  image: "test_image",
  description: "test_description",
  points: 25,
};
const EDIT_ACHIEVEMENT_VALUES = {
  id: 1,
  name: "test_name",
  image: "test_image",
  description: "test_description",
  points: 25,
};
const DELETE_ACHIEVEMENT_VALUES = {
  id: 1,
};
const GIVE_ACHIEVEMENT_VALUES = {
  user: "user_id",
  achievement: 1,
};

let commandCallback: (data: Interaction) => Promise<void>;

//mocks
jest.mock("../helper/common", () => ({
  ...jest.requireActual("../helper/common"),
  checkAdmin: jest.fn().mockReturnValue(true),
}));

jest.mock("../state/actions");
const mockGetApplication = getApplication as jest.Mock;
const mockSetCommandExecutedCallback =
  setCommandExecutedCallback as jest.Mock;
const mockAddPagination = addPagination as jest.Mock;
mockGetApplication.mockReturnValue({
  id: APPLICATION_ID,
});
mockSetCommandExecutedCallback.mockImplementation(
  (callback: (data: Interaction) => Promise<void>) => {
    commandCallback = callback;
  }
);

jest.mock("../discord/rest");
const mockEditOriginalInteractionResponse =
  editOriginalInteractionResponse as jest.Mock;

const mockLog = jest.fn();
const mockError = jest.fn();
jest.mock("../helper/logger");
(Logger as jest.Mock).mockImplementation(() => ({
  log: mockLog,
  error: mockError,
}));
jest.mock("../helper/interaction-pagination");

jest.mock("./database");
const mockGetAchievement = getAchievement as jest.Mock;
const mockCreateAchievement =
  createAchievement as jest.Mock;
mockGetAchievement.mockReturnValue(null);
const mockUpdateAchievement =
  updateAchievement as jest.Mock;
const mockDeleteAchievement =
  deleteAchievement as jest.Mock;
const mockGetAchievementById =
  getAchievementById as jest.Mock;
const mockGetUserAchievement =
  getUserAchievement as jest.Mock;
const mockGetAllUserAchievements =
  getAllUserAchievements as jest.Mock;
const mockGetServerRanks = getServerRanks as jest.Mock;
const mockCreateUserAchievement =
  createUserAchievement as jest.Mock;
const mockGetServerAchievements =
  getServerAchievements as jest.Mock;
const mockGetServerAchievementLeaderboard =
  getServerAchievementLeaderboard as jest.Mock;
const mockCreateRank = createRank as jest.Mock;
const mockGetRankByName = getRankByName as jest.Mock;
const mockGetRankByPoints = getRankByPoints as jest.Mock;
const mockDeleteRank = deleteRank as jest.Mock;

//helper values
const baseCommand = {
  id: COMMAND_ID,
  token: TOKEN,
  guild_id: GUILD_ID,
  member: { user: { id: USER_ID } },
  data: {
    name: MODULE_NAME,
  },
} as Interaction;

const createCommandOptions = [
  { name: "name", value: CREATE_ACHIEVEMENT_VALUES.name },
  { name: "image", value: CREATE_ACHIEVEMENT_VALUES.image },
  {
    name: "description",
    value: CREATE_ACHIEVEMENT_VALUES.description,
  },
  {
    name: "points",
    value: CREATE_ACHIEVEMENT_VALUES.points,
  },
];
const editCommandOptions = [
  { name: "id", value: EDIT_ACHIEVEMENT_VALUES.id },
  { name: "name", value: EDIT_ACHIEVEMENT_VALUES.name },
  { name: "image", value: EDIT_ACHIEVEMENT_VALUES.image },
  {
    name: "description",
    value: EDIT_ACHIEVEMENT_VALUES.description,
  },
  {
    name: "points",
    value: EDIT_ACHIEVEMENT_VALUES.points,
  },
];
const deleteCommandOptions = [
  { name: "id", value: DELETE_ACHIEVEMENT_VALUES.id },
];
const giveCommandOptions = [
  { name: "user", value: GIVE_ACHIEVEMENT_VALUES.user },
  {
    name: "achievement",
    value: GIVE_ACHIEVEMENT_VALUES.achievement,
  },
];

describe("Achievement Module", () => {
  let module: AchievementModule;
  beforeAll(() => {
    module = new AchievementModule();
    module.setUp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Create command", () => {
    it("should not try to get an achievement if name is missing, because that means something's very wrong with discord and the command is invalid", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "create",
              options: [],
            },
          ],
        },
      } as unknown as Interaction);

      expect(mockGetAchievement).not.toHaveBeenCalled();
    });

    it("should let the user know the achievement already exists", async () => {
      mockGetAchievement.mockReturnValueOnce(
        achievementFixture
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "create",
              options: createCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        mockEditOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: messageList.achievements.already_exists,
      });
    });

    it("should create the achievement and let the user know", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "create",
              options: createCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        mockCreateAchievement
      ).toHaveBeenLastCalledWith(
        GUILD_ID,
        CREATE_ACHIEVEMENT_VALUES.name,
        CREATE_ACHIEVEMENT_VALUES.image,
        CREATE_ACHIEVEMENT_VALUES.description,
        CREATE_ACHIEVEMENT_VALUES.points
      );

      expect(
        mockEditOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: stringReplacer(
          messageList.achievements.create_success,
          {
            name: CREATE_ACHIEVEMENT_VALUES.name,
          }
        ),
      });
    });
  });

  describe("Edit command", () => {
    it("should not try to get an achievement if id is missing, because that means something's very wrong with discord and the command is invalid", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "edit",
              options: [],
            },
          ],
        },
      } as unknown as Interaction);

      expect(mockUpdateAchievement).not.toHaveBeenCalled();
    });

    it("should let the user know the achievement doesn't exists", async () => {
      mockUpdateAchievement.mockReturnValueOnce(null);

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "edit",
              options: editCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        mockEditOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: stringReplacer(
          messageList.achievements.not_found,
          {
            id: EDIT_ACHIEVEMENT_VALUES.id,
          }
        ),
      });
    });

    it("should update the achievement and let the user know", async () => {
      mockUpdateAchievement.mockReturnValueOnce(
        EDIT_ACHIEVEMENT_VALUES
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "edit",
              options: editCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        mockUpdateAchievement
      ).toHaveBeenLastCalledWith(
        GUILD_ID,
        EDIT_ACHIEVEMENT_VALUES.id,
        EDIT_ACHIEVEMENT_VALUES.name,
        EDIT_ACHIEVEMENT_VALUES.image,
        EDIT_ACHIEVEMENT_VALUES.description,
        EDIT_ACHIEVEMENT_VALUES.points
      );

      expect(
        mockEditOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: stringReplacer(
          messageList.achievements.update_success,
          {
            name: EDIT_ACHIEVEMENT_VALUES.name,
          }
        ),
      });
    });
  });

  describe("Delete command", () => {
    it("should not try to do anything if id is missing, because that means something's very wrong with discord and the command is invalid", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "delete",
              options: [],
            },
          ],
        },
      } as unknown as Interaction);

      expect(mockDeleteAchievement).not.toHaveBeenCalled();
    });

    it("should delete the achievement and let the user know", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "delete",
              options: deleteCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        mockDeleteAchievement
      ).toHaveBeenLastCalledWith(
        GUILD_ID,
        DELETE_ACHIEVEMENT_VALUES.id
      );

      expect(
        mockEditOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: stringReplacer(
          messageList.achievements.update_success,
          {
            id: DELETE_ACHIEVEMENT_VALUES.id,
          }
        ),
      });
    });
  });

  describe("List command", () => {
    describe("Server command", () => {
      it("should let the user know there's no achievements in the server", async () => {
        mockGetServerAchievements.mockReturnValueOnce([]);

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "list",
                options: [{ name: "server" }],
              },
            ],
          },
        } as Interaction);

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
          content:
            messageList.achievements.server_no_achievements,
        });
      });

      it("should show a list of achievements", async () => {
        mockGetServerAchievements.mockReturnValueOnce(
          achievementListFixtures
        );
        mockEditOriginalInteractionResponse.mockReturnValueOnce(
          { id: "some_id" }
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "list",
                options: [{ name: "server" }],
              },
            ],
          },
        } as Interaction);

        expect(InteractionPagination).toHaveBeenCalledWith(
          APPLICATION_ID,
          [achievementListFixtures],
          expect.any(Function)
        );
        expect(addPagination).toHaveBeenCalled();
      });

      it("should create a pagination", async () => {
        mockGetServerAchievements.mockReturnValueOnce([
          ...achievementListFixtures,
          ...achievementListFixtures,
          ...achievementListFixtures,
          ...achievementListFixtures,
          ...achievementListFixtures,
          ...achievementListFixtures,
        ]);
        mockEditOriginalInteractionResponse.mockReturnValueOnce(
          { id: "some_id" }
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "list",
                options: [{ name: "server" }],
              },
            ],
          },
        } as Interaction);

        expect(InteractionPagination).toHaveBeenCalled();
        expect(mockAddPagination).toHaveBeenCalled();
      });
    });
    describe("User command", () => {
      it("should default to the list of the user if the command is requested without options", async () => {
        mockGetAllUserAchievements.mockReturnValueOnce([]);
        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "list",
                options: [],
              },
            ],
          },
        } as unknown as Interaction);

        expect(
          mockGetAllUserAchievements
        ).toHaveBeenLastCalledWith(GUILD_ID, USER_ID);
      });

      it("should use by default the id of the user requesting the command", async () => {
        mockGetAllUserAchievements.mockReturnValueOnce([]);
        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "list",
                options: [{ name: "user" }],
              },
            ],
          },
        } as Interaction);

        expect(
          mockGetAllUserAchievements
        ).toHaveBeenLastCalledWith(GUILD_ID, USER_ID);
      });

      it("should let the user know there's no achievements for the requested user", async () => {
        mockGetAllUserAchievements.mockReturnValueOnce([]);
        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "list",
                options: [
                  {
                    name: "user",
                    options: [
                      {
                        name: "user",
                        value: "some_random_user",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(
          mockGetAllUserAchievements
        ).toHaveBeenLastCalledWith(
          GUILD_ID,
          "some_random_user"
        );

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
          content:
            messageList.achievements.user_no_achievements,
        });
      });

      it("should show a list of achievements", async () => {
        const data = achievementListFixtures.map((ach) => ({
          achievement: ach,
          awardDate: new Date(),
        }));
        mockGetAllUserAchievements.mockReturnValueOnce(
          data
        );
        mockEditOriginalInteractionResponse.mockReturnValueOnce(
          { id: "some_id" }
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "list",
              },
            ],
          },
        } as Interaction);

        expect(InteractionPagination).toHaveBeenCalledWith(
          APPLICATION_ID,
          [data],
          expect.any(Function)
        );
        expect(addPagination).toHaveBeenCalled();
      });

      it("should create a pagination", async () => {
        mockGetAllUserAchievements.mockReturnValueOnce(
          [
            ...achievementListFixtures,
            ...achievementListFixtures,
            ...achievementListFixtures,
            ...achievementListFixtures,
            ...achievementListFixtures,
            ...achievementListFixtures,
          ].map((ach) => ({
            achievement: ach,
            awardDate: new Date(),
          }))
        );
        mockEditOriginalInteractionResponse.mockReturnValueOnce(
          { id: "some_id" }
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "list",
              },
            ],
          },
        } as Interaction);

        expect(InteractionPagination).toHaveBeenCalled();
        expect(mockAddPagination).toHaveBeenCalled();
      });
    });
  });

  describe("Rank command", () => {
    describe("List command", () => {
      it("should let the user know there's no ranks in the server", async () => {
        mockGetServerRanks.mockReturnValueOnce([]);

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [{ name: "list" }],
              },
            ],
          },
        } as Interaction);

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
          content: messageList.achievements.server_no_ranks,
        });
      });

      it("should show a list of ranks", async () => {
        mockGetServerRanks.mockReturnValueOnce(
          rankListFixtures
        );
        mockEditOriginalInteractionResponse.mockReturnValueOnce(
          { id: "some_id" }
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [{ name: "list" }],
              },
            ],
          },
        } as Interaction);

        expect(InteractionPagination).toHaveBeenCalledWith(
          APPLICATION_ID,
          [rankListFixtures],
          expect.any(Function)
        );
        expect(addPagination).toHaveBeenCalled();
      });

      it("should create a pagination", async () => {
        mockGetServerRanks.mockReturnValueOnce([
          ...rankListFixtures,
          ...rankListFixtures,
          ...rankListFixtures,
          ...rankListFixtures,
          ...rankListFixtures,
          ...rankListFixtures,
        ]);
        mockEditOriginalInteractionResponse.mockReturnValueOnce(
          { id: "some_id" }
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [{ name: "list" }],
              },
            ],
          },
        } as Interaction);

        expect(InteractionPagination).toHaveBeenCalledWith(
          APPLICATION_ID,
          expect.any(Array),
          expect.any(Function)
        );
        expect(mockAddPagination).toHaveBeenCalled();
      });
    });

    describe("User command", () => {
      it("should show the user's rank", async () => {
        mockGetAllUserAchievements.mockReturnValueOnce(
          achievementListFixtures.map((ach) => ({
            achievement: ach,
            awardDate: new Date(),
          }))
        );
        mockGetServerRanks.mockReturnValueOnce(
          rankListFixtures
        );
        mockEditOriginalInteractionResponse.mockReturnValueOnce(
          { id: "some_id" }
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [
                  {
                    name: "user",
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
          content: "",
          embeds: [expect.any(Object)],
        });
      });

      it("should use by default the id of the user requesting the command", async () => {
        mockGetAllUserAchievements.mockReturnValueOnce([]);
        mockGetServerRanks.mockReturnValueOnce([]);
        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [{ name: "user" }],
              },
            ],
          },
        } as Interaction);

        expect(
          mockGetAllUserAchievements
        ).toHaveBeenLastCalledWith(GUILD_ID, USER_ID);
      });

      it("should let the user know there's no achievements for the requested user", async () => {
        mockGetAllUserAchievements.mockReturnValueOnce([]);
        mockGetServerRanks.mockReturnValueOnce([]);
        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [
                  {
                    name: "user",
                    options: [
                      {
                        name: "user",
                        value: "some_random_user",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(
          mockGetAllUserAchievements
        ).toHaveBeenLastCalledWith(
          GUILD_ID,
          "some_random_user"
        );

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
          content:
            messageList.achievements.user_no_achievements,
        });
      });

      it("should let the user know there's no ranks in the server", async () => {
        mockGetAllUserAchievements.mockReturnValueOnce(
          achievementListFixtures.map((ach) => ({
            achievement: ach,
            awardDate: new Date(),
          }))
        );
        mockGetServerRanks.mockReturnValueOnce([]);

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [
                  {
                    name: "user",
                    options: [
                      {
                        name: "user",
                        value: "some_random_user",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(
          mockGetAllUserAchievements
        ).toHaveBeenLastCalledWith(
          GUILD_ID,
          "some_random_user"
        );

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
          content: messageList.achievements.server_no_ranks,
        });
      });
    });

    describe("Leaderboard command", () => {
      it("should display the server leaderboard", async () => {
        mockGetServerAchievementLeaderboard.mockReturnValueOnce(
          serverLeaderboardFixture
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [{ name: "leaderboard" }],
              },
            ],
          },
        } as Interaction);

        expect(
          InteractionPagination
        ).toHaveBeenLastCalledWith(
          APPLICATION_ID,
          [serverLeaderboardFixture],
          expect.any(Function)
        );
        expect(addPagination).toHaveBeenCalled();
      });
    });

    describe("Create command", () => {
      it("should let the user know he doesn't have permission", async () => {
        (checkAdmin as jest.Mock).mockReturnValueOnce(
          false
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [
                  {
                    name: "create",
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenCalledWith(APPLICATION_ID, TOKEN, {
          content: messageList.common.no_permission,
        });
      });

      it("should not try to create an achievement if name is missing, because that means something's very wrong with discord and the command is invalid", async () => {
        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [
                  {
                    name: "create",
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(mockCreateRank).not.toHaveBeenCalled();
      });

      it("should let the user know there's already a rank with that name", async () => {
        mockGetRankByName.mockReturnValueOnce(
          rankListFixtures[0]
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [
                  {
                    name: "create",
                    options: [
                      { name: "name", value: "some_rank" },
                      { name: "points", value: 25 },
                    ],
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(mockCreateRank).not.toHaveBeenCalled();

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
          content: stringReplacer(
            messageList.achievements.rank_exists,
            {
              name: "some_rank",
            }
          ),
        });
      });

      it("should let the user know there's already a rank with the same points", async () => {
        mockGetRankByName.mockReturnValueOnce(null);
        mockGetRankByPoints.mockReturnValueOnce(
          rankListFixtures[0]
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [
                  {
                    name: "create",
                    options: [
                      { name: "name", value: "some_rank" },
                      { name: "points", value: 25 },
                    ],
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(mockCreateRank).not.toHaveBeenCalled();

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
          content: stringReplacer(
            messageList.achievements.rank_point_exists,
            {
              points: 25,
              name: rankListFixtures[0].name,
            }
          ),
        });
      });

      it("should create the achievement and let the user know", async () => {
        mockGetRankByName.mockReturnValueOnce(null);
        mockGetRankByPoints.mockReturnValueOnce(null);

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [
                  {
                    name: "create",
                    options: [
                      { name: "name", value: "some_rank" },
                      { name: "points", value: 25 },
                    ],
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(mockCreateRank).toHaveBeenLastCalledWith(
          GUILD_ID,
          "some_rank",
          25
        );

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
          content: stringReplacer(
            messageList.achievements.rank_create_success,
            {
              points: 25,
              name: "some_rank",
            }
          ),
        });
      });
    });

    describe("Delete command", () => {
      it("should let the user know he doesn't have permission", async () => {
        (checkAdmin as jest.Mock).mockReturnValueOnce(
          false
        );

        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [
                  {
                    name: "delete",
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenCalledWith(APPLICATION_ID, TOKEN, {
          content: messageList.common.no_permission,
        });
      });

      it("should not try to delete an achievement if name is missing, because that means something's very wrong with discord and the command is invalid", async () => {
        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [
                  {
                    name: "delete",
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(mockDeleteRank).not.toHaveBeenCalled();
      });

      it("should delete the achievement and let the user know", async () => {
        await commandCallback({
          ...baseCommand,
          data: {
            ...baseCommand.data,
            options: [
              {
                name: "rank",
                options: [
                  {
                    name: "delete",
                    options: [
                      { name: "name", value: "some_rank" },
                    ],
                  },
                ],
              },
            ],
          },
        } as Interaction);

        expect(mockDeleteRank).toHaveBeenLastCalledWith(
          GUILD_ID,
          "some_rank"
        );

        expect(
          mockEditOriginalInteractionResponse
        ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
          content: messageList.achievements.rank_deleted,
        });
      });
    });
  });

  describe("Give command", () => {
    it("should not try to get an achievement if id is missing, because that means something's very wrong with discord and the command is invalid", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "give",
              options: [],
            },
          ],
        },
      } as unknown as Interaction);

      expect(mockGetAchievementById).not.toHaveBeenCalled();
    });

    it("should let the user know the achievement doesn't exists", async () => {
      mockGetAchievementById.mockReturnValueOnce(null);

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "give",
              options: giveCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        mockEditOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: stringReplacer(
          messageList.achievements.not_found,
          {
            id: GIVE_ACHIEVEMENT_VALUES.achievement,
          }
        ),
      });
    });

    it("should let the user know the user already had that achievement", async () => {
      mockGetAchievementById.mockReturnValueOnce(
        achievementFixture
      );
      mockGetUserAchievement.mockReturnValueOnce(
        achievementFixture
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "give",
              options: giveCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        mockCreateUserAchievement
      ).not.toHaveBeenCalled();
      expect(
        mockEditOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: stringReplacer(
          messageList.achievements.already_got,
          {
            user: `<@${GIVE_ACHIEVEMENT_VALUES.user}>`,
            id: GIVE_ACHIEVEMENT_VALUES.achievement,
          }
        ),
        allowed_mentions: no_mentions,
      });
    });

    it("should give the achievement to the user", async () => {
      mockGetAchievementById.mockReturnValueOnce(
        achievementFixture
      );
      mockGetUserAchievement.mockReturnValueOnce(null);
      mockGetAllUserAchievements.mockReturnValueOnce(
        userAchievementsFixtures
      );
      mockGetServerRanks.mockReturnValueOnce(
        rankListFixtures
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "give",
              options: giveCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        mockCreateUserAchievement
      ).toHaveBeenLastCalledWith(
        GUILD_ID,
        GIVE_ACHIEVEMENT_VALUES.user,
        achievementFixture
      );
      expect(
        mockEditOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: stringReplacer(
          messageList.achievements.given_success,
          {
            user: `<@${GIVE_ACHIEVEMENT_VALUES.user}>`,
            name: `\`${achievementFixture.name}\``,
          }
        ),
        embeds: [expect.any(Object), expect.any(Object)],
      });
    });
  });
});
