import { writeFileSync } from "fs";
import {
  deleteFile,
  stringReplacer,
} from "../helper/common";
import { badgeListFixture } from "./fixtures";
import messageList from "../helper/messages";
import {
  createBadgeListEmbed,
  createdBadgeEmbed,
  createGrid,
  giveBadgeEmbed,
  IFastAverageColorResult,
  updateListBadgesPage,
  updateUserListBadgesPage,
  userBadgeListEmbed,
} from "./helper";
import { IBadge } from "./models/badges.model";
import { getApplication } from "../state/actions";
import { editOriginalInteractionResponse } from "../discord/rest";

jest.mock("fs");
const mockWriteFileSync = writeFileSync as jest.Mock;

jest.mock("canvas", () => ({
  loadImage: jest.fn().mockReturnValue({}),
  createCanvas: jest.fn().mockReturnValue({
    getContext: jest.fn().mockReturnValue({
      drawImage: jest.fn(),
      fillText: jest.fn(),
    }),
    toBuffer: jest
      .fn()
      .mockReturnValue(Buffer.from("something")),
  }),
}));

jest.mock("../helper/common", () => ({
  ...jest.requireActual("../helper/common"),
  deleteFile: jest.fn(),
}));

jest.mock("../state/actions");
const mockGetApplication = getApplication as jest.Mock;

jest.mock("../discord/rest");
const mockEditOriginalInteractionResponse =
  editOriginalInteractionResponse as jest.Mock;

describe("Badges helper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createGrid", () => {
    it("should try to create an image in fs and not throw", async () => {
      await expect(
        createGrid(badgeListFixture as IBadge[])
      ).resolves.toEqual(expect.any(String));

      expect(mockWriteFileSync).toHaveBeenCalled();
    });
  });

  describe("createdBadgeEmbed", () => {
    it("should create an embed", () => {
      const name = "SOME NAME";
      const image = "SOME IMAGE";
      const color = { hex: "#123456" };
      expect(
        createdBadgeEmbed(
          name,
          image,
          color as IFastAverageColorResult
        )
      ).toEqual({
        title: "Badge created successfully",
        description: name,
        color: expect.any(Number),
        image: {
          url: `attachment://${image}`,
        },
      });
    });
  });

  describe("giveBadgeEmbed", () => {
    it("should create an embed", () => {
      const name = "SOME NAME";
      const image = "SOME IMAGE";
      const user = "SOME USER";
      const color = { hex: "#123456" };
      expect(
        giveBadgeEmbed(
          name,
          image,
          user,
          color as IFastAverageColorResult
        )
      ).toEqual({
        title: "Badge given successfully",
        description: `Badge \`${name}\` given to <@${user}> successfully.`,
        color: expect.any(Number),
        image: {
          url: `attachment://${image}`,
        },
      });
    });
  });

  describe("createBadgeListEmbed", () => {
    const fileName = "SOME NAME";
    it("should create an embed", async () => {
      await expect(
        createBadgeListEmbed(fileName, 1, 1)
      ).resolves.toEqual({
        title: "Server Badges",
        color: 3035554,
        image: {
          url: `attachment://${fileName}`,
        },
      });
    });

    it("should create an embed with pages in the footer", async () => {
      await expect(
        createBadgeListEmbed(fileName, 2, 4)
      ).resolves.toEqual({
        title: "Server Badges",
        color: 3035554,
        image: {
          url: `attachment://${fileName}`,
        },
        footer: {
          text: stringReplacer(messageList.common.page, {
            page: 2,
            total: 4,
          }),
        },
      });
    });
  });

  describe("userBadgeListEmbed", () => {
    const user = "SOME USER";
    const fileName = "SOME NAME";
    it("should create an embed", async () => {
      await expect(
        userBadgeListEmbed(user, fileName, 1, 1)
      ).resolves.toEqual({
        title: "User Badges",
        description: `<@${user}>`,
        color: 3035554,
        image: {
          url: `attachment://${fileName}`,
        },
      });
    });

    it("should create an embed with pages in the footer", async () => {
      await expect(
        userBadgeListEmbed(user, fileName, 2, 4)
      ).resolves.toEqual({
        title: "User Badges",
        description: `<@${user}>`,
        color: 3035554,
        image: {
          url: `attachment://${fileName}`,
        },
        footer: {
          text: stringReplacer(messageList.common.page, {
            page: 2,
            total: 4,
          }),
        },
      });
    });

    it("should create an embed with pages in the footer", async () => {
      await expect(
        userBadgeListEmbed(user, fileName, 2, 4)
      ).resolves.toEqual({
        title: "User Badges",
        description: `<@${user}>`,
        color: 3035554,
        image: {
          url: `attachment://${fileName}`,
        },
        footer: {
          text: stringReplacer(messageList.common.page, {
            page: 2,
            total: 4,
          }),
        },
      });
    });
  });

  describe("updateListBadgesPage", () => {
    const APPLICATION_ID = "APPLICATION_ID";
    const TOKEN = "TOKEN";

    it("should do nothing if the application is not set", async () => {
      mockGetApplication.mockReturnValueOnce(null);

      await updateListBadgesPage(
        badgeListFixture as IBadge[],
        2,
        4,
        "TOKEN"
      );

      expect(
        mockEditOriginalInteractionResponse
      ).not.toHaveBeenCalled();
    });

    it("should do update the message and delete the temp file created", async () => {
      mockGetApplication.mockReturnValueOnce({
        id: APPLICATION_ID,
      });

      await updateListBadgesPage(
        badgeListFixture as IBadge[],
        2,
        4,
        "TOKEN"
      );

      expect(
        mockEditOriginalInteractionResponse
      ).toHaveBeenCalledWith(
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
  });

  describe("updateUserListBadgesPage", () => {
    const APPLICATION_ID = "APPLICATION_ID";
    const TOKEN = "TOKEN";
    const MEMBER = { user: { id: "USER_ID" } };

    it("should do nothing if the application is not set", async () => {
      mockGetApplication.mockReturnValueOnce(null);

      await updateUserListBadgesPage(
        badgeListFixture as IBadge[],
        2,
        4,
        TOKEN,
        MEMBER as GuildMember
      );

      expect(
        mockEditOriginalInteractionResponse
      ).not.toHaveBeenCalled();
    });

    it("should do update the message and delete the temp file created", async () => {
      mockGetApplication.mockReturnValueOnce({
        id: APPLICATION_ID,
      });

      await updateUserListBadgesPage(
        badgeListFixture as IBadge[],
        2,
        4,
        TOKEN,
        MEMBER as GuildMember
      );

      expect(
        mockEditOriginalInteractionResponse
      ).toHaveBeenCalledWith(
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
  });
});
