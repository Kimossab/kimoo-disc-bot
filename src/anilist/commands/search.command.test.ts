import { editOriginalInteractionResponse } from "../../discord/rest";
import { InteractionPagination } from "../../helper/interaction-pagination";
import Logger from "../../helper/logger";
import messageList from "../../helper/messages";
import {
  addPagination,
  getApplication,
} from "../../state/store";
import {
  searchByQuery,
  searchByQueryAndType,
} from "../graphql/graphql";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import { searchCommand } from "./search.command";

jest.mock("../../state/store");
jest.mock("../../discord/rest");
jest.mock("../graphql/graphql");
jest.mock("../../helper/interaction-pagination");

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

(InteractionPagination as jest.Mock).mockImplementation(
  () => ({
    create: jest.fn(),
  })
);

const mockLogger = { log: jest.fn() } as unknown as Logger;
(getApplication as jest.Mock).mockReturnValue({
  id: "123456789",
});

const handler: CommandHandler = searchCommand(
  mockLogger,
  {} as AnilistRateLimit
);
const mockData = {
  guild_id: "randomGuildId",
  token: "randomToken",
  member: {},
};

describe("Anilist schedule command", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should request anilist using searchByQuery if no type is given", async () => {
    await handler(mockData, {
      options: [{ name: "query", value: "abcd" }],
    });
    expect(searchByQuery).toHaveBeenCalledWith(
      expect.any(Object),
      "abcd"
    );
  });

  it("should request anilist using searchByQueryAndType if a type is given", async () => {
    await handler(mockData, {
      options: [
        { name: "query", value: "abcd" },
        { name: "type", value: "ANIME" },
      ],
    });

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
    await handler(mockData, {
      options: [{ name: "query", value: "abcd" }],
    });

    expect(
      editOriginalInteractionResponse
    ).toHaveBeenCalledWith("123456789", "randomToken", {
      content: messageList.anilist.not_found,
    });
  });

  it('should edit message with "not_found" when an empty array is returned by anilist', async () => {
    (searchByQuery as jest.Mock).mockResolvedValueOnce(
      emptySearchResult
    );
    await handler(mockData, {
      options: [{ name: "query", value: "abcd" }],
    });
    expect(
      editOriginalInteractionResponse
    ).toHaveBeenCalledWith("123456789", "randomToken", {
      content: messageList.anilist.not_found,
    });
  });

  it("should create a new pagination with the correct values and add it to the pagination list", async () => {
    (searchByQuery as jest.Mock).mockResolvedValueOnce(
      searchResult
    );
    await handler(mockData, {
      options: [{ name: "query", value: "abcd" }],
    });

    expect(InteractionPagination).toHaveBeenCalledWith(
      "123456789",
      [expect.any(Object), expect.any(Object)],
      expect.any(Function)
    );

    expect(addPagination).toHaveBeenCalled();
  });
});
