import Logger from "@/helper/logger";
import {
  CommandHandler,
  CommandInteractionDataOption,
  Interaction,
} from "@/types/discord";

import { AnilistRateLimit } from "../helpers/rate-limiter";
import { subCommand } from "./sub.command";
import { subAddCommand } from "./subAdd.command";
import { subListCommand } from "./subList.command";

jest.mock("./subAdd.command");
jest.mock("./subList.command");

const subAdd = jest.fn();
const subList = jest.fn();
(subAddCommand as jest.Mock).mockReturnValue(subAdd);
(subListCommand as jest.Mock).mockReturnValue(subList);

const mockLogger = { log: jest.fn() } as unknown as Logger;
const mockData = {
  guild_id: "randomGuildId",
  token: "randomToken",
  member: {},
} as Interaction;

const handler: CommandHandler = subCommand(
  mockLogger,
  {} as AnilistRateLimit,
  [],
  jest.fn()
);

describe("Anilist schedule command", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call sub add command", async () => {
    await handler(mockData, {
      options: [
        {
          name: "add",
          options: [{ name: "test", value: "test" }],
        },
      ],
    } as CommandInteractionDataOption);
    expect(subAdd).toHaveBeenCalledWith(mockData, {
      name: "add",
      options: [{ name: "test", value: "test" }],
    });
  });

  it("should call sub list command", async () => {
    await handler(mockData, {
      options: [
        {
          name: "list",
          options: [{ name: "test", value: "test" }],
        },
      ],
    } as CommandInteractionDataOption);
    expect(subList).toHaveBeenCalledWith(mockData, {
      name: "list",
      options: [{ name: "test", value: "test" }],
    });
  });
});
