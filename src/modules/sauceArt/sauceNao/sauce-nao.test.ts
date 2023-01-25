import { editOriginalInteractionResponse } from "@/discord/rest";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { addPagination } from "@/state/store";
import { Application, Interaction } from "@/types/discord";

import { sauceNaoDataFixtures } from "./fixtures";
import { requestSauceNao } from "./request";
import handleSauceNao from "./sauce-nao";

const MODULE_NAME = "wiki";
const COMMAND_ID = "COMMAND_ID";
const TOKEN = "TOKEN";
const GUILD_ID = "GUILD_ID";
const USER_ID = "USER_ID";
const IMAGE = "SOME_IMAGE";
const APPLICATION_DATA = {
  id: "APPLICATION_ID",
} as Application;

jest.mock("axios");
jest.mock("@/state/store");
jest.mock("./request");
jest.mock("@/discord/rest");
jest.mock("@/helper/logger");
jest.mock("@/helper/pagination");

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
} as Interaction;

describe("Sauce nao module", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should let the user know there was nothing found", async () => {
    (requestSauceNao as jest.Mock).mockResolvedValueOnce(null);

    await handleSauceNao(
      baseCommand,
      IMAGE,
      APPLICATION_DATA,
      new Logger(MODULE_NAME)
    );
    expect(editOriginalInteractionResponse).toHaveBeenCalledWith(
      APPLICATION_DATA.id,
      TOKEN,
      {
        content: messageList.sauce.not_found,
      }
    );
  });

  it.each([1, -1])(
    "should let the user know there was nothing found when sauce nao response header status is %s",
    async (status) => {
      (requestSauceNao as jest.Mock).mockResolvedValueOnce({
        header: { status },
      });

      await handleSauceNao(
        baseCommand,
        IMAGE,
        APPLICATION_DATA,
        new Logger(MODULE_NAME)
      );

      expect(editOriginalInteractionResponse).toHaveBeenCalledWith(
        APPLICATION_DATA.id,
        TOKEN,
        {
          content: messageList.sauce.not_found,
        }
      );
    }
  );

  it("should attempt to map the response data for each result", async () => {
    (requestSauceNao as jest.Mock).mockResolvedValueOnce(sauceNaoDataFixtures);

    (editOriginalInteractionResponse as jest.Mock).mockResolvedValueOnce({});

    await handleSauceNao(
      baseCommand,
      IMAGE,
      APPLICATION_DATA,
      new Logger(MODULE_NAME)
    );

    // expect(Pagination).toHaveBeenCalled();
    expect(addPagination).toHaveBeenCalled();
  });

  it("should let the user know no data was found", async () => {
    (requestSauceNao as jest.Mock).mockResolvedValueOnce({
      ...sauceNaoDataFixtures,
      results: sauceNaoDataFixtures.results.filter(
        (f) => Number(f.header.similarity) < 75
      ),
    });

    await handleSauceNao(
      baseCommand,
      IMAGE,
      APPLICATION_DATA,
      new Logger(MODULE_NAME)
    );

    expect(editOriginalInteractionResponse).toHaveBeenCalledWith(
      APPLICATION_DATA.id,
      TOKEN,
      {
        content: messageList.sauce.not_found,
      }
    );
  });
});
