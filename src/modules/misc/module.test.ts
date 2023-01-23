import { editOriginalInteractionResponse } from "@/discord/rest";
import { checkAdmin } from "@/helper/common";
import { downloadImage } from "@/helper/images";
import Logger from "@/helper/logger";
import { getApplication, setCommandExecutedCallback } from "@/state/store";
import { Interaction } from "@/types/discord";

import MiscModule from "./module";

const MODULE_NAME = "misc";
const APPLICATION_ID = "APPLICATION_ID";
const COMMAND_ID = "COMMAND_ID";
const TOKEN = "TOKEN";
const GUILD_ID = "GUILD_ID";
const USER_ID = "USER_ID";

let commandCallback: (data: Interaction) => Promise<void>;

// Common mocks
jest.mock("axios");
jest.mock("@/state/store");
jest.mock("@/discord/rest");
jest.mock("@/helper/images");
jest.mock("@/helper/logger");
jest.mock("@/helper/pagination");
jest.mock("@/helper/common", () => ({
  ...jest.requireActual("@/helper/common"),
  checkAdmin: jest.fn().mockReturnValue(true),
  deleteFile: jest.fn(),
  moveFile: jest.fn(),
}));

(Logger as jest.Mock).mockImplementation(() => ({
  log: jest.fn(),
  error: jest.fn(),
}));

(getApplication as jest.Mock).mockReturnValue({
  id: APPLICATION_ID,
});
(checkAdmin as jest.Mock).mockReturnValue(true);
(downloadImage as jest.Mock).mockReturnValue({
  success: true,
});
(setCommandExecutedCallback as unknown as jest.Mock).mockImplementation(
  (callback: (data: Interaction) => Promise<void>) => {
    commandCallback = callback;
  }
);

// Specific mocks
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

describe("Badges module", () => {
  let module: MiscModule;
  beforeAll(() => {
    module = new MiscModule(true);
    module.setUp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Groups command", () => {
    it("should give the user his groups", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "group",
              options: [
                {
                  name: "groups",
                  value: "2",
                },
                {
                  name: "values",
                  value: "1|2|3|4",
                },
              ],
            },
          ],
        },
      } as Interaction);

      expect(editOriginalInteractionResponse).toHaveBeenCalledWith(
        APPLICATION_ID,
        TOKEN,
        {
          content: "",
          embeds: [expect.any(Object)],
        }
      );
    });
  });

  describe("Donut command", () => {
    it("should give the user his donut", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "donut",
            },
          ],
        },
      } as Interaction);

      expect(editOriginalInteractionResponse).toHaveBeenCalledWith(
        APPLICATION_ID,
        TOKEN,
        {
          content: expect.any(String),
        }
      );
    });
  });
});
