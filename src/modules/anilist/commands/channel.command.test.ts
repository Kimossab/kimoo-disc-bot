import {
  getServerAnimeChannel,
  setServerAnimeChannel,
} from "@/bot/database";
import { editOriginalInteractionResponse } from "@/discord/rest";
import Logger from "@/helper/logger";
import { getApplication } from "@/state/store";

import { channelCommand } from "./channel.command";

jest.mock("@/state/store");
jest.mock("@/bot/database");
jest.mock("@/discord/rest");

const mockLogger = { log: jest.fn() } as unknown as Logger;
(getApplication as jest.Mock).mockReturnValue({
  id: "123456789",
});
(getServerAnimeChannel as jest.Mock).mockReturnValue(
  "1234567890"
);

const handler: CommandHandler = channelCommand(mockLogger);
const mockData = {
  guild_id: "randomGuildId",
  token: "randomToken",
  member: {},
};

describe("Anilist channel command", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when no channel is given", () => {
    beforeEach(() => {
      handler(mockData, { options: [] });
    });

    it("should get the anime channel from the database", () => {
      expect(getServerAnimeChannel).toHaveBeenCalledWith(
        "randomGuildId"
      );
    });

    it("should update the interaction response", () => {
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenCalledWith("123456789", "randomToken", {
        content: "Server's anime channel: <#1234567890>",
      });
    });
  });

  describe("when a channel is given", () => {
    beforeEach(() => {
      handler(mockData, {
        options: [
          {
            name: "channel",
            value: "someNewChannel",
          },
        ],
      });
    });

    it("should get the anime channel from the database", () => {
      expect(setServerAnimeChannel).toHaveBeenCalledWith(
        "randomGuildId",
        "someNewChannel"
      );
    });

    it("should update the interaction response", () => {
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenCalledWith("123456789", "randomToken", {
        content:
          "Anime channel set successfully to <#someNewChannel>",
      });
    });
  });
});
