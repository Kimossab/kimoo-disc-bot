import { editOriginalInteractionResponse } from "../discord/rest";
import { checkAdmin } from "../helper/common";
import { FANDOM_LINKS } from "../helper/constants";
import Logger from "../helper/logger";
import messageList from "../helper/messages";
import {
  addPagination,
  getApplication,
  setCommandExecutedCallback,
} from "../state/store";
import { Interaction } from "../types/discord";
import FandomModule from "./module";
import { requestFandom } from "./request";

const MODULE_NAME = "wiki";
const APPLICATION_ID = "APPLICATION_ID";
const COMMAND_ID = "COMMAND_ID";
const TOKEN = "TOKEN";
const GUILD_ID = "GUILD_ID";
const USER_ID = "USER_ID";

const FANDOM_VALUES = {
  fandom: "fandom",
  query: "query",
};

let commandCallback: (data: Interaction) => Promise<void>;

// Common mocks
jest.mock("../state/store");
jest.mock("../discord/rest");
jest.mock("../helper/images");
jest.mock("../helper/logger");
jest.mock("../helper/pagination");
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

(setCommandExecutedCallback as unknown as jest.Mock).mockImplementation(
  (callback: (data: Interaction) => Promise<void>) => {
    commandCallback = callback;
  }
);

// specific mocks
jest.mock("./request");
(requestFandom as jest.Mock).mockResolvedValue([
  "link1",
  "link2",
  "link3",
  "link4",
  "link5",
]);

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

const wikiCommandOptions = [
  { name: "fandom", value: FANDOM_VALUES.fandom },
  { name: "query", value: FANDOM_VALUES.query },
];

describe("Fandom Module", () => {
  let module: FandomModule;
  beforeAll(() => {
    module = new FandomModule(true);
    module.setUp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should let the user know the command parameters are invalid", async () => {
    await commandCallback({
      ...baseCommand,
      data: {
        ...baseCommand.data,
        options: [
          { name: "fandom", value: "invalid fandom" },
          { name: "query", value: FANDOM_VALUES.query },
        ],
      },
    } as Interaction);

    expect(editOriginalInteractionResponse).toHaveBeenLastCalledWith(
      APPLICATION_ID,
      TOKEN,
      {
        content: messageList.fandom.invalid_slug,
      }
    );
  });

  it("should use a predefined fandom slug", async () => {
    await commandCallback({
      ...baseCommand,
      data: {
        ...baseCommand.data,
        options: [
          {
            name: "fandom",
            value: Object.keys(FANDOM_LINKS)[0],
          },
          { name: "query", value: FANDOM_VALUES.query },
        ],
      },
    } as Interaction);

    expect(requestFandom).toHaveBeenLastCalledWith(
      FANDOM_LINKS[Object.keys(FANDOM_LINKS)[0]],
      FANDOM_VALUES.query
    );
  });

  it("should let the user know nothing was found", async () => {
    (requestFandom as jest.Mock).mockResolvedValueOnce(null);
    await commandCallback({
      ...baseCommand,
      data: {
        ...baseCommand.data,
        options: wikiCommandOptions,
      },
    } as Interaction);

    expect(editOriginalInteractionResponse).toHaveBeenLastCalledWith(
      APPLICATION_ID,
      TOKEN,
      {
        content: "Nothing found",
      }
    );
  });

  it("should show the first link and create pagination", async () => {
    (editOriginalInteractionResponse as jest.Mock).mockResolvedValueOnce({
      id: "MESSAGE_ID",
    });
    await commandCallback({
      ...baseCommand,
      data: {
        ...baseCommand.data,
        options: wikiCommandOptions,
      },
    } as Interaction);

    expect(editOriginalInteractionResponse).toHaveBeenLastCalledWith(
      APPLICATION_ID,
      TOKEN,
      {
        content: "link1",
      }
    );
    // expect(Pagination).toHaveBeenCalled();
    expect(addPagination).toHaveBeenCalled();
  });
});
