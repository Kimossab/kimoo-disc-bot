import { editOriginalInteractionResponse } from "@/discord/rest";
import { InteractionPagination } from "@/helper/interaction-pagination";
import Logger from "@/helper/logger";
import { manyUserSubs, manyUserSubsAnilist } from "@/helper/mocks/factories";
import { addPagination, getApplication } from "@/state/store";
import { CommandInteractionDataOption, Interaction } from "@/types/discord";

import { getUserSubs } from "../database";
import { searchForUser } from "../graphql/graphql";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import subListCommand from "./subList.command";

jest.mock("@/helper/interaction-pagination");
jest.mock("@/discord/rest");
jest.mock("../graphql/graphql");
jest.mock("../database");
jest.mock("@/state/store");

const mockLogger = { log: jest.fn() } as unknown as Logger;
const mockData = {
  guild_id: "randomGuildId",
  token: "randomToken",
  member: { user: { id: "1234567890" } },
} as Interaction;

(InteractionPagination as jest.Mock).mockImplementation(() => ({
  create: jest.fn(),
}));
(getApplication as jest.Mock).mockReturnValue({
  id: "123456789",
});
const mockUserSubs = manyUserSubs(30);
(getUserSubs as jest.Mock).mockResolvedValue(mockUserSubs);

const { handler } = subListCommand(mockLogger, {} as AnilistRateLimit);

describe("Anilist schedule command", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get the subscriptions of the user getUserSubs", async () => {
    await handler(mockData, {} as CommandInteractionDataOption);

    expect(getUserSubs).toHaveBeenCalledWith("randomGuildId", "1234567890");
  });

  it("should edit message with 'No subscriptions' when there's no sub", async () => {
    (getUserSubs as jest.Mock).mockResolvedValueOnce([]);

    await handler(mockData, {} as CommandInteractionDataOption);

    expect(editOriginalInteractionResponse).toHaveBeenCalledWith(
      "123456789",
      "randomToken",
      {
        content: "No subscriptions",
      }
    );
  });

  it("should get info from anilist for those subscriptions", async () => {
    await handler(mockData, {} as CommandInteractionDataOption);

    expect(searchForUser).toHaveBeenCalledTimes(2);
    expect(searchForUser).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining(
        Array.from({ length: 25 }, () => expect.any(Number))
      )
    );
    expect(searchForUser).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining(
        Array.from({ length: 5 }, () => expect.any(Number))
      )
    );
  });

  it("should edit message with 'No subscriptions' when anilist returns nothing", async () => {
    (searchForUser as jest.Mock).mockResolvedValueOnce(null);
    (searchForUser as jest.Mock).mockResolvedValueOnce(null);

    await handler(mockData, {} as CommandInteractionDataOption);

    expect(editOriginalInteractionResponse).toHaveBeenCalledWith(
      "123456789",
      "randomToken",
      {
        content: "No subscriptions",
      }
    );
  });

  it("should create a new pagination with the correct values and add it to the pagination list", async () => {
    (searchForUser as jest.Mock).mockResolvedValueOnce(manyUserSubsAnilist(25));
    (searchForUser as jest.Mock).mockResolvedValueOnce(manyUserSubsAnilist(5));

    await handler(mockData, {} as CommandInteractionDataOption);

    expect(InteractionPagination).toHaveBeenCalledWith(
      "123456789",
      [
        Array.from({ length: 25 }, () => expect.any(Object)),
        Array.from({ length: 5 }, () => expect.any(Object)),
      ],
      expect.any(Function)
    );

    expect(addPagination).toHaveBeenCalled();
  });
});
