import { editOriginalInteractionResponse } from "../discord/rest";
import { checkAdmin } from "../helper/common";
import { InteractionPagination } from "../helper/interaction-pagination";
import Logger from "../helper/logger";
import messageList from "../helper/messages";
import {
  addPagination,
  getApplication,
  setCommandExecutedCallback,
} from "../state/actions";
import { Interaction } from "../types/discord";
import {
  searchByQuery,
  searchByQueryAndType,
} from "./graphql";
import { mapMediaToEmbed } from "./mappers/mapMediaToEmbed";
import AnilistModule from "./module";
import { MediaType } from "./types/graphql";

const MODULE_NAME = "anilist";
const APPLICATION_ID = "APPLICATION_ID";
const COMMAND_ID = "COMMAND_ID";
const TOKEN = "TOKEN";
const GUILD_ID = "GUILD_ID";
const USER_ID = "USER_ID";

let commandCallback: (data: Interaction) => Promise<void>;

// Common mocks
jest.mock("../state/actions");
jest.mock("../discord/rest");
jest.mock("../helper/logger");
jest.mock("../helper/interaction-pagination");
jest.mock("../helper/common", () => ({
  ...jest.requireActual("../helper/common"),
  checkAdmin: jest.fn().mockReturnValue(true),
  deleteFile: jest.fn(),
  moveFile: jest.fn(),
  snowflakeToDate: jest.fn(),
}));

(Logger as jest.Mock).mockImplementation(() => ({
  log: jest.fn(),
  error: jest.fn(),
}));

(getApplication as jest.Mock).mockReturnValue({
  id: APPLICATION_ID,
});
(checkAdmin as jest.Mock).mockReturnValue(true);

(
  setCommandExecutedCallback as jest.Mock
).mockImplementation(
  (callback: (data: Interaction) => Promise<void>) => {
    commandCallback = callback;
  }
);

// specific mocks
jest.mock("./graphql");
jest.mock("./mappers/mapMediaToEmbed");

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

const searchCommandOptions = {
  name: "query",
  value: "SOMETHING",
};

describe("Anilist module", () => {
  let module: AnilistModule;
  beforeAll(() => {
    module = new AnilistModule();
    module.setUp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Search command", () => {
    it("should request without type when none is given", async () => {
      (mapMediaToEmbed as jest.Mock).mockResolvedValueOnce([
        {},
        {},
      ]);
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "search",
              options: [searchCommandOptions],
            },
          ],
        },
      } as Interaction);

      expect(searchByQuery).toHaveBeenCalled();
    });

    it("should let the user know nothing was found", async () => {
      (
        searchByQueryAndType as jest.Mock
      ).mockResolvedValueOnce([]);
      (mapMediaToEmbed as jest.Mock).mockReturnValueOnce(
        []
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "search",
              options: [
                searchCommandOptions,
                { name: "type", value: MediaType.ANIME },
              ],
            },
          ],
        },
      } as Interaction);

      expect(searchByQueryAndType).toHaveBeenCalled();
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenCalledWith(APPLICATION_ID, TOKEN, {
        content: messageList.anilist.not_found,
      });
    });

    it("should use pagination", async () => {
      (
        searchByQueryAndType as jest.Mock
      ).mockResolvedValueOnce([{}, {}]);
      (mapMediaToEmbed as jest.Mock).mockReturnValueOnce([
        {},
        {},
      ]);
      (
        editOriginalInteractionResponse as jest.Mock
      ).mockResolvedValueOnce({});

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "search",
              options: [
                searchCommandOptions,
                { name: "type", value: MediaType.ANIME },
              ],
            },
          ],
        },
      } as Interaction);

      expect(InteractionPagination).toHaveBeenCalled();
      expect(addPagination).toHaveBeenCalled();
    });

    it("should not use pagination", async () => {
      (
        searchByQueryAndType as jest.Mock
      ).mockResolvedValueOnce([{}]);
      (mapMediaToEmbed as jest.Mock).mockReturnValueOnce([
        {},
      ]);
      (
        editOriginalInteractionResponse as jest.Mock
      ).mockResolvedValueOnce({});

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "search",
              options: [
                searchCommandOptions,
                { name: "type", value: MediaType.ANIME },
              ],
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenCalled();
      expect(InteractionPagination).not.toHaveBeenCalled();
      expect(addPagination).not.toHaveBeenCalled();
    });
  });
});