import { editOriginalInteractionResponse } from "../discord/rest";
import { checkAdmin } from "../helper/common";
import Logger from "../helper/logger";
import {
  getApplication,
  getChannelLastAttachment,
  setCommandExecutedCallback,
} from "../state/actions";
import SauceModule from "./module";
import messageList from "../helper/messages";
import handleSauceNao from "./sauceNao/sauce-nao";
import handleTraceMoe from "./traceMoe/trace-moe";

const MODULE_NAME = "sauce";
const APPLICATION_ID = "APPLICATION_ID";
const COMMAND_ID = "COMMAND_ID";
const TOKEN = "TOKEN";
const GUILD_ID = "GUILD_ID";
const USER_ID = "USER_ID";
const LAST_ATTACHMENT = "LAST_ATTACHMENT";

let commandCallback: (
  data: discord.interaction
) => Promise<void>;

// Common mocks
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

(getChannelLastAttachment as jest.Mock).mockReturnValue(
  LAST_ATTACHMENT
);
(getApplication as jest.Mock).mockReturnValue({
  id: APPLICATION_ID,
});
(checkAdmin as jest.Mock).mockReturnValue(true);
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
jest.mock("./sauceNao/sauce-nao");
jest.mock("./traceMoe/trace-moe");

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

describe("Sauce Module", () => {
  let module: SauceModule;
  beforeAll(() => {
    module = new SauceModule();
    module.setUp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should let the user know there's no image found", async () => {
    (
      getChannelLastAttachment as jest.Mock
    ).mockReturnValueOnce(null);

    await commandCallback({
      ...baseCommand,
      data: {
        ...baseCommand.data,
      },
    } as discord.interaction);

    expect(
      editOriginalInteractionResponse
    ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
      content: messageList.sauce.image_not_found,
    });
  });

  it("should default to last attachment and type art", async () => {
    await commandCallback(
      baseCommand as discord.interaction
    );

    expect(handleSauceNao).toHaveBeenLastCalledWith(
      baseCommand,
      LAST_ATTACHMENT,
      {
        id: APPLICATION_ID,
      },
      expect.any(Object)
    );
  });

  it("should call trace moe for type of anime", async () => {
    const commandData = {
      ...baseCommand,
      data: {
        ...baseCommand.data,
        options: [
          {
            name: "image",
            value: "test_image",
          },
          { name: "type", value: "anime" },
        ],
      },
    } as discord.interaction;
    await commandCallback(commandData);

    expect(handleTraceMoe).toHaveBeenLastCalledWith(
      commandData,
      "test_image",
      {
        id: APPLICATION_ID,
      },
      expect.any(Object)
    );
  });

  it("should call sauce nao for type of art", async () => {
    const commandData = {
      ...baseCommand,
      data: {
        ...baseCommand.data,
        options: [
          {
            name: "image",
            value: "test_image",
          },
          { name: "type", value: "art" },
        ],
      },
    } as discord.interaction;
    await commandCallback(commandData);

    expect(handleSauceNao).toHaveBeenLastCalledWith(
      commandData,
      "test_image",
      {
        id: APPLICATION_ID,
      },
      expect.any(Object)
    );
  });
});
