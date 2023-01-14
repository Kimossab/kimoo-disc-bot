import { editOriginalInteractionResponse } from "../discord/rest";
import { InteractionPagination } from "../helper/interaction-pagination";
import messageList from "../helper/messages";
import {
  manyUserSubs,
  manyUserSubsAnilist,
  randomAiringSchedule,
} from "../helper/mocks/factories";
import {
  addPagination,
  getApplication,
  setCommandExecutedCallback,
} from "../state/store";
import {
  CommandInteractionDataOption,
  Interaction,
} from "../types/discord";
import { AnimeManager } from "./helpers/anime-manager";
import {
  addSubscription,
  getAllAnimeNotifications,
  getUserSubs,
  setNextAiring,
} from "./database";
import {
  getAiringSchedule,
  searchByQuery,
  searchByQueryAndType,
  searchForAiringSchedule,
  searchForUser,
} from "./graphql/graphql";
import AnilistModule from "./module";

jest.mock("../bot/database");
jest.mock("./database");
jest.mock("./graphql");
jest.mock("../discord/rest");
jest.mock("./anime-manager");
jest.mock("./rate-limiter");
jest.mock("../helper/logger");
jest.mock("../state/store");
jest.mock("../helper/interaction-pagination");

(AnimeManager as jest.Mock).mockImplementation(
  (...props) => ({
    props,
    id: props[2].id,
    checkNextEpisode: jest.fn(),
  })
);
(InteractionPagination as jest.Mock).mockImplementation(
  () => ({
    create: jest.fn(),
  })
);

const mockUserSubs = manyUserSubs(30);
(getUserSubs as jest.Mock).mockResolvedValue(mockUserSubs);
(getAllAnimeNotifications as jest.Mock).mockResolvedValue([
  {
    id: 123456,
    nextAiring: 987654,
  },
]);
(getApplication as jest.Mock).mockReturnValue({
  id: "123456789",
});
(setNextAiring as jest.Mock).mockResolvedValue({
  id: 456789,
  nextAiring: {},
});

const searchResult = {
  Page: {
    total: 2,
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    perPage: 2,
    media: [
      {
        id: 123,
        title: {
          english: "anime",
        },
        isAdult: false,
        nextAiringEpisode: {
          airingAt: 1234,
          timeUntilAiring: 60,
          episode: 1,
        },
        coverImage: { medium: "image" },
        siteUrl: "url",
        type: "ANIME",
        format: "TV",
        status: "FINISHED",
        startDate: {
          day: 1,
          month: 1,
          year: 1,
        },
        endDate: {
          day: 1,
          month: 1,
          year: 1,
        },
        relations: { edges: [] },
      },
      {
        id: 321,
        title: {
          english: "anime2",
        },
        isAdult: false,
        nextAiringEpisode: {
          airingAt: 4321,
          timeUntilAiring: 60,
          episode: 12,
        },
        coverImage: { medium: "image2" },
        siteUrl: "url2",
        type: "ANIME",
        format: "TV",
        status: "FINISHED",
        startDate: {
          day: 1,
          month: 1,
          year: 1,
        },
        endDate: {
          day: 1,
          month: 1,
          year: 1,
        },
        relations: { edges: [] },
      },
    ],
  },
};
const emptySearchResult = {
  Page: {
    total: 0,
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    perPage: 0,
    media: [],
  },
};
const airingScheduleResult = {
  Media: {
    id: 123456789,
    title: {},
    coverImage: {},
    nextAiringEpisode: { id: 456789 },
  },
};

describe("Anilist Module", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when module is deactivated", () => {
    beforeEach(async () => {
      await new AnilistModule(false).setUp();
    });

    it("should not get data from the database", () => {
      expect(
        getAllAnimeNotifications
      ).not.toHaveBeenCalled();
    });
  });

  describe("when module is active", () => {
    let module: AnilistModule;
    let callback: (data: Interaction) => Promise<void>;

    (
      setCommandExecutedCallback as jest.Mock
    ).mockImplementation(
      (cb: (data: Interaction) => Promise<void>) => {
        callback = cb;
      }
    );

    beforeEach(async () => {
      module = new AnilistModule(true);
      await module.setUp();
    });

    describe(".setUp", () => {
      it("should get all the anime notifications", () => {
        expect(getAllAnimeNotifications).toHaveBeenCalled();
      });

      it("should create a new manager", () => {
        expect(AnimeManager).toHaveBeenCalled();
      });

      it("should have 1 entry in the animeList", () => {
        expect((module as any).animeList.length).toEqual(1);
      });
    });

    describe("search command", () => {
      const callHandler = (
        options: Partial<CommandInteractionDataOption>[]
      ) =>
        callback({
          guild_id: "123456789",
          member: {},
          token: "random-token",
          data: {
            name: "anilist",
            options: [
              {
                name: "search",
                options,
              },
            ],
          },
        } as Interaction);

      it("should request anilist using searchByQuery if no type is given", async () => {
        await callHandler([
          { name: "query", value: "abcd" },
        ]);
        expect(searchByQuery).toHaveBeenCalledWith(
          expect.any(Object),
          "abcd"
        );
      });

      it("should request anilist using searchByQueryAndType if a type is given", async () => {
        await callHandler([
          { name: "query", value: "abcd" },
          { name: "type", value: "ANIME" },
        ]);
        expect(searchByQueryAndType).toHaveBeenCalledWith(
          expect.any(Object),
          "abcd",
          "ANIME"
        );
      });

      it('should edit message with "not_found" when no data is returned by anilist', async () => {
        (searchByQuery as jest.Mock).mockResolvedValueOnce(
          null
        );
        await callHandler([
          { name: "query", value: "abcd" },
        ]);
        expect(
          editOriginalInteractionResponse
        ).toHaveBeenCalledWith(
          "123456789",
          "random-token",
          {
            content: messageList.anilist.not_found,
          }
        );
      });

      it('should edit message with "not_found" when an empty array is returned by anilist', async () => {
        (searchByQuery as jest.Mock).mockResolvedValueOnce(
          emptySearchResult
        );
        await callHandler([
          { name: "query", value: "abcd" },
        ]);
        expect(
          editOriginalInteractionResponse
        ).toHaveBeenCalledWith(
          "123456789",
          "random-token",
          {
            content: messageList.anilist.not_found,
          }
        );
      });

      it("should create a new pagination with the correct values and add it to the pagination list", async () => {
        (searchByQuery as jest.Mock).mockResolvedValueOnce(
          searchResult
        );
        await callHandler([
          { name: "query", value: "abcd" },
        ]);

        expect(InteractionPagination).toHaveBeenCalledWith(
          "123456789",
          [expect.any(Object), expect.any(Object)],
          expect.any(Function)
        );

        expect(addPagination).toHaveBeenCalled();
      });
    });

    describe("sub command", () => {
      const callHandler = (
        options: Partial<CommandInteractionDataOption>[]
      ) =>
        callback({
          guild_id: "123456789",
          member: { user: { id: "123789" } },
          token: "random-token",
          data: {
            name: "anilist",
            options: [
              {
                name: "sub",
                options,
              },
            ],
          },
        } as Interaction);

      describe("add command", () => {
        const callHandlerSubCmd = (
          options: Partial<CommandInteractionDataOption>[]
        ) =>
          callHandler([
            {
              name: "add",
              options:
                options as CommandInteractionDataOption[],
            },
          ]);

        it("should call the handleSubAdd function", async () => {
          const spyHandleSubAdd = jest.spyOn(
            module as any,
            "handleSubAdd"
          );
          const spyHandleSubList = jest.spyOn(
            module as any,
            "handleSubList"
          );
          await callHandlerSubCmd([]);
          expect(spyHandleSubAdd).toHaveBeenCalledWith(
            expect.any(Object),
            { name: "add", options: [] }
          );
          expect(spyHandleSubList).not.toHaveBeenCalled();
        });

        it("should request anilist using searchForAiringSchedule", async () => {
          await callHandlerSubCmd([
            { name: "anime", value: "abcd" },
          ]);
          expect(
            searchForAiringSchedule
          ).toHaveBeenCalledWith(
            expect.any(Object),
            "abcd"
          );
        });

        it('should edit message with "not_found" when no data is returned by anilist', async () => {
          (
            searchForAiringSchedule as jest.Mock
          ).mockResolvedValueOnce(null);
          await callHandlerSubCmd([
            { name: "anime", value: "abcd" },
          ]);
          expect(
            editOriginalInteractionResponse
          ).toHaveBeenCalledWith(
            "123456789",
            "random-token",
            {
              content: messageList.anilist.not_found,
            }
          );
        });

        it("should add a subscription for the anime requested", async () => {
          (
            searchForAiringSchedule as jest.Mock
          ).mockResolvedValueOnce(airingScheduleResult);
          await callHandlerSubCmd([
            { name: "anime", value: "abcd" },
          ]);

          expect(addSubscription).toHaveBeenCalledWith(
            "123456789",
            "123789",
            123456789
          );
        });

        it("should add a new entry to the animeList object", async () => {
          (
            searchForAiringSchedule as jest.Mock
          ).mockResolvedValueOnce(airingScheduleResult);
          await callHandlerSubCmd([
            { name: "anime", value: "abcd" },
          ]);

          expect((module as any).animeList.length).toEqual(
            2
          );
        });

        it("should call the setNextAiring", async () => {
          (
            searchForAiringSchedule as jest.Mock
          ).mockResolvedValueOnce(airingScheduleResult);
          await callHandlerSubCmd([
            { name: "anime", value: "abcd" },
          ]);

          expect(setNextAiring).toHaveBeenCalledWith(
            123456789,
            456789
          );
        });

        it("should not add a new entry to the animeList object", async () => {
          (
            searchForAiringSchedule as jest.Mock
          ).mockResolvedValueOnce({
            ...airingScheduleResult,
            Media: {
              ...airingScheduleResult.Media,
              id: 123456,
            },
          });
          await callHandlerSubCmd([
            { name: "anime", value: "abcd" },
          ]);

          expect((module as any).animeList.length).toEqual(
            1
          );
        });

        it("should edit message with an embed", async () => {
          (
            searchForAiringSchedule as jest.Mock
          ).mockResolvedValueOnce(airingScheduleResult);
          await callHandlerSubCmd([
            { name: "anime", value: "abcd" },
          ]);
          expect(
            editOriginalInteractionResponse
          ).toHaveBeenCalledWith(
            "123456789",
            "random-token",
            {
              content: "",
              embeds: [expect.any(Object)],
            }
          );
        });
      });

      describe("list command", () => {
        const callHandlerSubCmd = (
          options?: Partial<CommandInteractionDataOption>[]
        ) =>
          callHandler([
            {
              name: "list",
              options:
                options as CommandInteractionDataOption[],
            },
          ]);

        it("should call the handleSubList function", async () => {
          const spyHandleSubAdd = jest.spyOn(
            module as any,
            "handleSubAdd"
          );
          const spyHandleSubList = jest.spyOn(
            module as any,
            "handleSubList"
          );
          await callHandlerSubCmd();
          expect(spyHandleSubAdd).not.toHaveBeenCalled();
          expect(spyHandleSubList).toHaveBeenCalledWith(
            expect.any(Object),
            { name: "list", options: undefined }
          );
        });

        it("should get the subscriptions of the user getUserSubs", async () => {
          await callHandlerSubCmd();
          expect(getUserSubs).toHaveBeenCalledWith(
            "123456789",
            "123789"
          );
        });

        it("should edit message with 'No subscriptions' when there's no sub", async () => {
          (getUserSubs as jest.Mock).mockResolvedValueOnce(
            []
          );
          await callHandlerSubCmd();
          expect(
            editOriginalInteractionResponse
          ).toHaveBeenCalledWith(
            "123456789",
            "random-token",
            {
              content: "No subscriptions",
            }
          );
        });

        it("should get info from anilist for those subscriptions", async () => {
          await callHandlerSubCmd();
          expect(searchForUser).toHaveBeenCalledTimes(2);
          expect(searchForUser).toHaveBeenCalledWith(
            expect.any(Object),
            expect.arrayContaining(
              Array.from({ length: 25 }, () =>
                expect.any(Number)
              )
            )
          );
          expect(searchForUser).toHaveBeenCalledWith(
            expect.any(Object),
            expect.arrayContaining(
              Array.from({ length: 5 }, () =>
                expect.any(Number)
              )
            )
          );
        });

        it("should edit message with 'No subscriptions' when anilist returns nothing", async () => {
          (
            searchForUser as jest.Mock
          ).mockResolvedValueOnce(null);
          (
            searchForUser as jest.Mock
          ).mockResolvedValueOnce(null);
          await callHandlerSubCmd();
          expect(
            editOriginalInteractionResponse
          ).toHaveBeenCalledWith(
            "123456789",
            "random-token",
            {
              content: "No subscriptions",
            }
          );
        });

        it("should create a new pagination with the correct values and add it to the pagination list", async () => {
          (
            searchForUser as jest.Mock
          ).mockResolvedValueOnce(manyUserSubsAnilist(25));
          (
            searchForUser as jest.Mock
          ).mockResolvedValueOnce(manyUserSubsAnilist(5));

          await callHandlerSubCmd();

          expect(
            InteractionPagination
          ).toHaveBeenCalledWith(
            "123456789",
            [
              Array.from({ length: 25 }, () =>
                expect.any(Object)
              ),
              Array.from({ length: 5 }, () =>
                expect.any(Object)
              ),
            ],
            expect.any(Function)
          );

          expect(addPagination).toHaveBeenCalled();
        });
      });
    });

    describe("schedule command", () => {
      const callHandler = (
        options: Partial<CommandInteractionDataOption>[]
      ) =>
        callback({
          guild_id: "123456789",
          member: {},
          token: "random-token",
          data: {
            name: "anilist",
            options: [
              {
                name: "schedule",
                options,
              },
            ],
          },
        } as Interaction);

      it("should request anilist using getAiringSchedule", async () => {
        await callHandler([
          { name: "query", value: "abcd" },
        ]);
        expect(getAiringSchedule).toHaveBeenCalledWith(
          expect.any(Object),
          "abcd"
        );
      });

      it('should edit message with "not_found" when no data is returned by anilist', async () => {
        (
          getAiringSchedule as jest.Mock
        ).mockResolvedValueOnce(null);

        await callHandler([
          { name: "query", value: "abcd" },
        ]);

        expect(
          editOriginalInteractionResponse
        ).toHaveBeenCalledWith(
          "123456789",
          "random-token",
          {
            content: messageList.anilist.not_found,
          }
        );
      });

      it("should edit message with an embed", async () => {
        (
          getAiringSchedule as jest.Mock
        ).mockResolvedValueOnce(randomAiringSchedule());

        await callHandler([
          { name: "query", value: "abcd" },
        ]);

        expect(
          editOriginalInteractionResponse
        ).toHaveBeenCalledWith(
          "123456789",
          "random-token",
          {
            content: "",
            embeds: [expect.any(Object)],
          }
        );
      });
    });

    // describe("channel command", () => {});
  });
});
