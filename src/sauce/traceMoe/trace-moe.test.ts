import { editOriginalInteractionResponse } from "../../discord/rest";
import Logger from "../../helper/logger";
import { requestTraceMoe } from "./request";
import handleTraceMoe from "./trace-moe";
import messageList from "../../helper/messages";
import Pagination from "../../helper/pagination";
import { addPagination } from "../../state/actions";
import { traceMoeEmbed } from "./mapper";

const MODULE_NAME = "wiki";
const COMMAND_ID = "COMMAND_ID";
const TOKEN = "TOKEN";
const GUILD_ID = "GUILD_ID";
const USER_ID = "USER_ID";
const IMAGE = "SOME_IMAGE";
const APPLICATION_DATA = {
  id: "APPLICATION_ID",
} as discord.application_object;

jest.mock("axios");
jest.mock("./mapper");
jest.mock("../../state/actions");
jest.mock("./request");
jest.mock("../../discord/rest");
jest.mock("../../helper/logger");
jest.mock("../../helper/pagination");

(Logger as jest.Mock).mockImplementation(() => ({
  error: jest.fn(),
}));

const baseCommand = {
  id: COMMAND_ID,
  token: TOKEN,
  guild_id: GUILD_ID,
  member: { user: { id: USER_ID } },
  data: {
    name: MODULE_NAME,
  },
} as discord.interaction;

describe("Trace moe module", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should let the user know there was nothing found", async () => {
    (requestTraceMoe as jest.Mock).mockResolvedValueOnce(
      null
    );

    await handleTraceMoe(
      baseCommand,
      IMAGE,
      APPLICATION_DATA,
      new Logger(MODULE_NAME)
    );
    expect(
      editOriginalInteractionResponse
    ).toHaveBeenCalledWith(APPLICATION_DATA.id, TOKEN, {
      content: messageList.sauce.not_found,
    });
  });

  it("should attempt to map the response data for each result", async () => {
    (requestTraceMoe as jest.Mock).mockResolvedValueOnce({
      result: [{}],
    });
    (traceMoeEmbed as jest.Mock).mockReturnValue({});
    (
      editOriginalInteractionResponse as jest.Mock
    ).mockReturnValue({});

    await handleTraceMoe(
      baseCommand,
      IMAGE,
      APPLICATION_DATA,
      new Logger(MODULE_NAME)
    );
    (
      editOriginalInteractionResponse as jest.Mock
    ).mockResolvedValueOnce({});

    expect(Pagination).toHaveBeenCalled();
    expect(addPagination).toHaveBeenCalled();
  });
});
