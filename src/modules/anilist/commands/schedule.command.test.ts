import { editOriginalInteractionResponse } from "@/discord/rest";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { randomAiringSchedule } from "@/helper/mocks/factories";
import { getApplication } from "@/state/store";

import { getAiringSchedule } from "../graphql/graphql";
import { AnilistRateLimit } from "../helpers/rate-limiter";
import { scheduleCommand } from "./schedule.command";

jest.mock("@/state/store");
jest.mock("@/discord/rest");
jest.mock("../graphql/graphql");

const mockLogger = { log: jest.fn() } as unknown as Logger;
(getApplication as jest.Mock).mockReturnValue({
  id: "123456789",
});
const handler: CommandHandler = scheduleCommand(
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

  it("should request anilist using getAiringSchedule", async () => {
    await handler(mockData, {
      options: [{ name: "query", value: "abcd" }],
    });

    expect(getAiringSchedule).toHaveBeenCalledWith(
      expect.any(Object),
      "abcd"
    );
  });

  it('should edit message with "not_found" when no data is returned by anilist', async () => {
    (getAiringSchedule as jest.Mock).mockResolvedValueOnce(
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

  it("should edit message with an embed", async () => {
    (getAiringSchedule as jest.Mock).mockResolvedValueOnce(
      randomAiringSchedule()
    );

    await handler(mockData, {
      options: [{ name: "query", value: "abcd" }],
    });

    expect(
      editOriginalInteractionResponse
    ).toHaveBeenCalledWith("123456789", "randomToken", {
      content: "",
      embeds: [expect.any(Object)],
    });
  });
});
