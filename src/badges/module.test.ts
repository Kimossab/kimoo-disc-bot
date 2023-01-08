import {
  checkAdmin,
  deleteFile,
  moveFile,
} from "../helper/common";
import {
  addPagination,
  getApplication,
  getChannelLastAttachment,
  setCommandExecutedCallback,
} from "../state/store";
import BadgesModule from "./module";
import messageList from "../helper/messages";
import {
  checkBadgeUser,
  checkName,
  createBadge,
  deleteBadge,
  getAllBadges,
  getAllUserBadges,
  getByName,
  giveBadge,
} from "./database";
import { badgeListFixture } from "./fixtures";
import { getAverageColor } from "fast-average-color-node";
import { editOriginalInteractionResponse } from "../discord/rest";
import { downloadImage } from "../helper/images";
import Logger from "../helper/logger";
import { Interaction } from "../types/discord";

const MODULE_NAME = "badges";
const APPLICATION_ID = "APPLICATION_ID";
const COMMAND_ID = "COMMAND_ID";
const TOKEN = "TOKEN";
const GUILD_ID = "GUILD_ID";
const USER_ID = "USER_ID";
const LAST_ATTACHMENT = "LAST_ATTACHMENT";

const CREATE_ACHIEVEMENT_VALUES = {
  name: "test_name",
  image: "test_image",
};
const GIVE_ACHIEVEMENT_VALUES = {
  name: "test_name",
  user: "test_user",
};
const USER_ACHIEVEMENT_VALUES = {
  user: "test_user",
};
const DELETE_ACHIEVEMENT_VALUES = {
  name: "test_user",
};

let commandCallback: (data: Interaction) => Promise<void>;

// Common mocks
jest.mock("axios");
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
(downloadImage as jest.Mock).mockReturnValue({
  success: true,
});
(
  setCommandExecutedCallback as unknown as jest.Mock
).mockImplementation(
  (callback: (data: Interaction) => Promise<void>) => {
    commandCallback = callback;
  }
);

// Specific mocks
jest.mock("./database");
jest.mock("fast-average-color-node");
jest.mock("./helper", () => ({
  ...jest.requireActual("./helper"),
  createGrid: jest.fn().mockReturnValue("IMAGE_NAME"),
}));

(deleteBadge as jest.Mock).mockReturnValue(
  badgeListFixture[0]
);
(checkName as jest.Mock).mockReturnValue(false);
(getAllBadges as jest.Mock).mockReturnValue(
  badgeListFixture
);
(getByName as jest.Mock).mockReturnValue(
  badgeListFixture[0]
);
(checkBadgeUser as jest.Mock).mockReturnValue(false);
(giveBadge as jest.Mock).mockReturnValue(
  badgeListFixture[0]
);
(getAllUserBadges as jest.Mock).mockReturnValue([
  {
    badges: badgeListFixture,
  },
]);

(getAverageColor as jest.Mock).mockReturnValue({
  hex: "#123456",
});
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

const createCommandOptions = [
  { name: "name", value: CREATE_ACHIEVEMENT_VALUES.name },
  { name: "image", value: CREATE_ACHIEVEMENT_VALUES.image },
];
const giveCommandOptions = [
  { name: "name", value: GIVE_ACHIEVEMENT_VALUES.name },
  { name: "user", value: GIVE_ACHIEVEMENT_VALUES.user },
];
const userCommandOptions = [
  { name: "user", value: USER_ACHIEVEMENT_VALUES.user },
];
const deleteCommandOptions = [
  { name: "name", value: DELETE_ACHIEVEMENT_VALUES.name },
];

describe("Badges module", () => {
  let module: BadgesModule;
  beforeAll(() => {
    module = new BadgesModule(true);
    module.setUp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Create command", () => {
    it("should let the user know there's no image to use", async () => {
      (
        getChannelLastAttachment as jest.Mock
      ).mockReturnValueOnce(null);

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "create",
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: messageList.common.no_image,
      });
    });

    it("should let the user know there's already a badge with that name", async () => {
      (checkName as jest.Mock).mockReturnValueOnce(true);

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "create",
              options: createCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: "Badge with that name already exists.",
      });
    });

    it("should default to the last attachment if no image is given", async () => {
      (checkName as jest.Mock).mockReturnValueOnce(false);
      (downloadImage as jest.Mock).mockReturnValueOnce({
        success: false,
      });

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "create",
              options: createCommandOptions.filter(
                (opt) => opt.name !== "image"
              ),
            },
          ],
        },
      } as Interaction);

      expect(downloadImage).toHaveBeenLastCalledWith(
        LAST_ATTACHMENT,
        expect.any(String)
      );
    });

    it("should let the user know if it has failed to download the image", async () => {
      (checkName as jest.Mock).mockReturnValueOnce(false);
      (downloadImage as jest.Mock).mockReturnValueOnce({
        success: false,
      });

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "create",
              options: createCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content:
          "URL is not an image or image is too big (max 20MB)",
      });
    });

    it("should let delete the file and let the user know something went wrong", async () => {
      (checkName as jest.Mock).mockReturnValueOnce(false);
      (downloadImage as jest.Mock).mockReturnValueOnce({
        success: true,
      });
      (createBadge as jest.Mock).mockReturnValueOnce(null);

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "create",
              options: createCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(deleteFile).toHaveBeenCalled();
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: "Something went wrong",
      });
    });

    it("should move the file and let the user know it all worked", async () => {
      (checkName as jest.Mock).mockReturnValueOnce(false);
      (downloadImage as jest.Mock).mockReturnValueOnce({
        success: true,
      });
      (createBadge as jest.Mock).mockReturnValueOnce(
        badgeListFixture[0]
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "create",
              options: createCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(deleteFile).not.toHaveBeenCalled();
      expect(moveFile).toHaveBeenCalled();
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(
        APPLICATION_ID,
        TOKEN,
        {
          content: "",
          embeds: [expect.any(Object)],
        },
        expect.any(String)
      );
    });
  });

  describe("List command", () => {
    it("should create the image, send and then delete it", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "list",
            },
          ],
        },
      } as Interaction);

      expect(deleteFile).toHaveBeenCalled();
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(
        APPLICATION_ID,
        TOKEN,
        {
          content: "",
          embeds: [expect.any(Object)],
          attachments: [],
        },
        expect.any(String)
      );
    });

    it("should create the pagination", async () => {
      (
        editOriginalInteractionResponse as jest.Mock
      ).mockReturnValueOnce({
        id: "SOME_MESSAGE",
      });
      (getAllBadges as jest.Mock).mockReturnValue([
        ...badgeListFixture,
        ...badgeListFixture,
        ...badgeListFixture,
        ...badgeListFixture,
        ...badgeListFixture,
        ...badgeListFixture,
        ...badgeListFixture,
      ]);

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "list",
            },
          ],
        },
      } as Interaction);

      // expect(Pagination).toHaveBeenCalled();
      expect(addPagination).toHaveBeenCalled();
    });
  });

  describe("Give command", () => {
    it("should let the user know there's no bdage with that name", async () => {
      (getByName as jest.Mock).mockReturnValueOnce(null);

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "give",
              options: giveCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: messageList.badges.not_found,
      });
    });

    it("should let the user know already has that badge", async () => {
      (checkBadgeUser as jest.Mock).mockReturnValueOnce(
        true
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "give",
              options: giveCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: "User already has this badge.",
      });
    });

    it("should show internal server error", async () => {
      (giveBadge as jest.Mock).mockReturnValueOnce(null);
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "give",
              options: giveCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: messageList.common.internal_error,
      });
    });

    it("should let the user know it has given the badge successfully", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "give",
              options: giveCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(
        APPLICATION_ID,
        TOKEN,
        {
          content: "",
          embeds: [expect.any(Object)],
        },
        expect.any(String)
      );
    });
  });

  describe("User command", () => {
    it("should default to the user calling the command", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "user",
            },
          ],
        },
      } as Interaction);

      expect(getAllUserBadges).toHaveBeenCalledWith(
        baseCommand.member?.user?.id,
        baseCommand.guild_id
      );
    });

    it("should let let the user know there's no badges for the user", async () => {
      (getAllUserBadges as jest.Mock).mockReturnValueOnce(
        []
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "user",
              options: userCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: "No badges found",
      });
    });

    it("should let show the image with badges and delete the file", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "user",
              options: userCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(
        APPLICATION_ID,
        TOKEN,
        {
          content: "",
          embeds: [expect.any(Object)],
          attachments: [],
        },
        expect.any(String)
      );
      expect(deleteFile).toHaveBeenCalled();
    });

    it("should create the pagination", async () => {
      (getAllUserBadges as jest.Mock).mockReturnValueOnce([
        {
          badges: [
            ...badgeListFixture,
            ...badgeListFixture,
            ...badgeListFixture,
            ...badgeListFixture,
            ...badgeListFixture,
            ...badgeListFixture,
            ...badgeListFixture,
          ],
        },
      ]);
      (
        editOriginalInteractionResponse as jest.Mock
      ).mockReturnValueOnce({
        id: "SOME_MESSAGE",
      });

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "user",
              options: userCommandOptions,
            },
          ],
        },
      } as Interaction);

      // expect(Pagination).toHaveBeenCalled();
      expect(addPagination).toHaveBeenCalled();
    });
  });

  describe("Delete command", () => {
    it("should let the user know there's no badge with that name", async () => {
      (deleteBadge as jest.Mock).mockReturnValueOnce(null);

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "delete",
              options: deleteCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: messageList.badges.not_found,
      });
    });

    it("should delete the file and let the user know", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "delete",
              options: deleteCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(deleteFile).toHaveBeenCalled();
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: expect.any(String),
      });
    });
  });
});
