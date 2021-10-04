import { editOriginalInteractionResponse } from "../discord/rest";
import { checkAdmin } from "../helper/common";
import { downloadImage } from "../helper/images";
import Logger from "../helper/logger";
import Pagination from "../helper/pagination";
import {
  addPagination,
  getApplication,
  setCommandExecutedCallback,
} from "../state/actions";
import { vndbSearchEmbed } from "./helper";
import VNDBModule from "./module";
import { VNDBApi } from "./vndb-api";

const MODULE_NAME = "vn";
const APPLICATION_ID = "APPLICATION_ID";
const COMMAND_ID = "COMMAND_ID";
const TOKEN = "TOKEN";
const GUILD_ID = "GUILD_ID";
const USER_ID = "USER_ID";
const INVALID_SEARCH_VALUE = "INVALID_SEARCH_VALUE";
const VALID_SEARCH_VALUE = "VALID_SEARCH_VALUE";

(VNDBApi as jest.Mock).mockImplementation(() => ({
  search: (searchValue: string) =>
    searchValue === INVALID_SEARCH_VALUE ? [] : [{}],
}));

let commandCallback: (
  data: discord.interaction
) => Promise<void>;

// Common mocks
jest.mock("axios");
jest.mock("../state/actions");
jest.mock("../discord/rest");
jest.mock("../helper/images");
jest.mock("../helper/logger");
jest.mock("../helper/pagination");
jest.mock("../helper/common", () => ({
  ...jest.requireActual("../helper/common"),
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
(
  setCommandExecutedCallback as jest.Mock
).mockImplementation(
  (
    callback: (data: discord.interaction) => Promise<void>
  ) => {
    commandCallback = callback;
  }
);

// Specific mocks
jest.mock("./vndb-api");
jest.mock("./helper");

//helper values
const baseCommand = {
  id: COMMAND_ID,
  token: TOKEN,
  guild_id: GUILD_ID,
  member: { user: { id: USER_ID } },
  data: {
    name: MODULE_NAME,
  },
} as discord.interaction;

describe("VNDB module", () => {
  let module: VNDBModule;

  beforeAll(() => {
    module = new VNDBModule();
    module.setUp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should let the user know nothing was found", async () => {
    await commandCallback({
      ...baseCommand,
      data: {
        ...baseCommand.data,
        options: [
          {
            name: "search",
            value: INVALID_SEARCH_VALUE,
          },
        ],
      },
    } as discord.interaction);

    expect(editOriginalInteractionResponse).toBeCalledWith(
      APPLICATION_ID,
      TOKEN,
      {
        content: "not found",
      }
    );
  });

  it("should create pagination", async () => {
    (vndbSearchEmbed as jest.Mock).mockReturnValue({});
    (
      editOriginalInteractionResponse as jest.Mock
    ).mockReturnValue({});

    await commandCallback({
      ...baseCommand,
      data: {
        ...baseCommand.data,
        options: [
          {
            name: "search",
            value: VALID_SEARCH_VALUE,
          },
        ],
      },
    } as discord.interaction);

    expect(Pagination).toHaveBeenCalled();
    expect(addPagination).toHaveBeenCalled();
  });
});
