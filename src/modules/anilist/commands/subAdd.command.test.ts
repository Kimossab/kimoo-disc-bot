import { editOriginalInteractionResponse } from "@/discord/rest";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getApplication } from "@/state/store";
import { CommandInteractionDataOption, Interaction } from "@/types/discord";

import { addSubscription, setNextAiring } from "../database";
import { searchForAiringSchedule } from "../graphql/graphql";
import { AnimeManager } from "../helpers/anime-manager";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import { subAddCommand } from "./subAdd.command";

jest.mock("@/state/store");
jest.mock("@/discord/rest");
jest.mock("../graphql/graphql");
jest.mock("../database");
jest.mock("../helpers/anime-manager");

const mockLogger = { log: jest.fn() } as unknown as Logger;
(getApplication as jest.Mock).mockReturnValue({
  id: "123456789",
});

(setNextAiring as jest.Mock).mockResolvedValue({
  id: 456789,
  nextAiring: {},
});

(AnimeManager as jest.Mock).mockImplementation((...props) => ({
  props,
  id: props[2].id,
  checkNextEpisode: jest.fn(),
}));

const mockData = {
  guild_id: "randomGuildId",
  token: "randomToken",
  member: {},
} as Interaction;

const airingScheduleResult = {
  Media: {
    id: 123456789,
    title: {},
    coverImage: {},
    nextAiringEpisode: { id: 456789 },
  },
};

describe("Anilist schedule command", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should request anilist using searchForAiringSchedule", async () => {
    await subAddCommand(
      mockLogger,
      {} as AnilistRateLimit,
      [],
      jest.fn()
    )(mockData, {
      options: [{ name: "anime", value: "abcd" }],
    } as CommandInteractionDataOption);

    expect(searchForAiringSchedule).toHaveBeenCalledWith({}, "abcd");
  });

  it('should edit message with "not_found" when no data is returned by anilist', async () => {
    (searchForAiringSchedule as jest.Mock).mockResolvedValueOnce(null);

    await subAddCommand(
      mockLogger,
      {} as AnilistRateLimit,
      [],
      jest.fn()
    )(mockData, {
      options: [{ name: "anime", value: "abcd" }],
    } as CommandInteractionDataOption);

    expect(editOriginalInteractionResponse).toHaveBeenCalledWith(
      "123456789",
      "randomToken",
      {
        content: messageList.anilist.not_found,
      }
    );
  });

  it("should add a subscription for the anime requested", async () => {
    (searchForAiringSchedule as jest.Mock).mockResolvedValueOnce(
      airingScheduleResult
    );

    await subAddCommand(
      mockLogger,
      {} as AnilistRateLimit,
      [],
      jest.fn()
    )(mockData, {
      options: [{ name: "anime", value: "abcd" }],
    } as CommandInteractionDataOption);

    expect(addSubscription).toHaveBeenCalledWith(
      "randomGuildId",
      "",
      123456789
    );
  });

  it("should add a new entry to the animeList object", async () => {
    (searchForAiringSchedule as jest.Mock).mockResolvedValueOnce(
      airingScheduleResult
    );

    const animeList: AnimeManager[] = [];
    await subAddCommand(
      mockLogger,
      {} as AnilistRateLimit,
      animeList,
      jest.fn()
    )(mockData, {
      options: [{ name: "anime", value: "abcd" }],
    } as CommandInteractionDataOption);

    expect(animeList.length).toEqual(1);
  });

  it("should call the setNextAiring", async () => {
    (searchForAiringSchedule as jest.Mock).mockResolvedValueOnce(
      airingScheduleResult
    );

    await subAddCommand(
      mockLogger,
      {} as AnilistRateLimit,
      [],
      jest.fn()
    )(mockData, {
      options: [{ name: "anime", value: "abcd" }],
    } as CommandInteractionDataOption);

    expect(setNextAiring).toHaveBeenCalledWith(123456789, 456789);
  });

  it("should not add a new entry to the animeList object", async () => {
    (searchForAiringSchedule as jest.Mock).mockResolvedValueOnce({
      ...airingScheduleResult,
      Media: {
        ...airingScheduleResult.Media,
        id: 123456,
      },
    });

    const animeList: AnimeManager[] = [{ id: 123456 } as AnimeManager];

    await subAddCommand(
      mockLogger,
      {} as AnilistRateLimit,
      animeList,
      jest.fn()
    )(mockData, {
      options: [{ name: "anime", value: "abcd" }],
    } as CommandInteractionDataOption);

    expect(animeList.length).toEqual(1);
  });

  it("should edit message with an embed", async () => {
    (searchForAiringSchedule as jest.Mock).mockResolvedValueOnce(
      airingScheduleResult
    );

    await subAddCommand(
      mockLogger,
      {} as AnilistRateLimit,
      [],
      jest.fn()
    )(mockData, {
      options: [{ name: "anime", value: "abcd" }],
    } as CommandInteractionDataOption);

    expect(editOriginalInteractionResponse).toHaveBeenCalledWith(
      "123456789",
      "randomToken",
      {
        content: "",
        embeds: [expect.any(Object)],
      }
    );
  });
});
