import {
  getServerAnimeChannel,
  setServerBirthdayChannel,
} from "../bot/database";
import { editOriginalInteractionResponse } from "../discord/rest";
import {
  checkAdmin,
  snowflakeToDate,
} from "../helper/common";
import Logger from "../helper/logger";
import {
  getApplication,
  setCommandExecutedCallback,
} from "../state/actions";
import {
  addBirthday,
  getBirthdays,
  getBirthdaysByMonth,
  getServersBirthdayChannel,
  getUserBirthday,
} from "./database";
import { birthdayFixtureOne } from "./fixtures";
import BirthdayModule from "./module";
import messageList from "../helper/messages";
import { no_mentions } from "../helper/constants";
import { Interaction } from "../types/discord";

const MODULE_NAME = "birthday";
const APPLICATION_ID = "APPLICATION_ID";
const COMMAND_ID = "COMMAND_ID";
const TOKEN = "TOKEN";
const GUILD_ID = "GUILD_ID";
const USER_ID = "USER_ID";

const CHANNEL_BIRTHDAY_VALUES = {
  channel: "test_channel",
};
const ADD_BIRTHDAY_VALUES = {
  day: 25,
  month: 5,
  year: 2001,
};
const REMOVE_BIRTHDAY_VALUES = {
  user: "test_user",
};
const GET_USER_BIRTHDAY_VALUES = {
  user: "test_user",
};
const GET_MONTH_BIRTHDAY_VALUES = {
  month: 2,
};

let commandCallback: (data: Interaction) => Promise<void>;

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
jest.mock("../bot/bot.controller");
jest.mock("./database");

(getServersBirthdayChannel as jest.Mock).mockReturnValue(
  {}
);
(getBirthdays as jest.Mock).mockReturnValue([]);

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

const channelCommandOptions = [
  {
    name: "channel",
    value: CHANNEL_BIRTHDAY_VALUES.channel,
  },
];
const addCommandOptions = [
  { name: "day", value: ADD_BIRTHDAY_VALUES.day },
  { name: "month", value: ADD_BIRTHDAY_VALUES.month },
  { name: "year", value: ADD_BIRTHDAY_VALUES.year },
];
const removeCommandOptions = [
  { name: "user", value: REMOVE_BIRTHDAY_VALUES.user },
];
const getUserCommandOptions = [
  { name: "user", value: GET_USER_BIRTHDAY_VALUES.user },
];
const getMonthCommandOptions = [
  { name: "month", value: GET_MONTH_BIRTHDAY_VALUES.month },
];

describe("Birthday module", () => {
  let module: BirthdayModule;
  beforeAll(() => {
    module = new BirthdayModule();
    module.setUp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    module.clear();
  });

  it("should request the server and user birthday channels", () => {
    expect(getServersBirthdayChannel).toHaveBeenCalled();
    expect(getBirthdays).toHaveBeenCalled();
  });

  describe("Channel command", () => {
    it("should set the server birthday channel", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "channel",
              options: channelCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        setServerBirthdayChannel
      ).toHaveBeenLastCalledWith(
        GUILD_ID,
        CHANNEL_BIRTHDAY_VALUES.channel
      );

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: expect.any(String),
      });
    });

    it("should get the server birthday channel", async () => {
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "channel",
            },
          ],
        },
      } as Interaction);

      expect(
        getServerAnimeChannel
      ).toHaveBeenLastCalledWith(GUILD_ID);
    });
  });

  describe("Add command", () => {
    it("should let the user know he already has a birthday set", async () => {
      (getUserBirthday as jest.Mock).mockResolvedValueOnce(
        birthdayFixtureOne
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "add",
              options: addCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: messageList.birthday.already_set,
      });
    });

    it("should set the birthday of the user", async () => {
      (getUserBirthday as jest.Mock).mockResolvedValueOnce(
        null
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "add",
              options: addCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(addBirthday).toHaveBeenLastCalledWith(
        GUILD_ID,
        USER_ID,
        ADD_BIRTHDAY_VALUES.day,
        ADD_BIRTHDAY_VALUES.month,
        ADD_BIRTHDAY_VALUES.year
      );

      expect(
        editOriginalInteractionResponse
      ).toHaveBeenLastCalledWith(APPLICATION_ID, TOKEN, {
        content: expect.any(String),
      });
    });
  });

  describe("Remove command", () => {
    it("should use the requester id by default and let the user know there's no birthday on the database", async () => {
      (getUserBirthday as jest.Mock).mockResolvedValueOnce(
        null
      );
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "remove",
            },
          ],
        },
      } as Interaction);

      expect(getUserBirthday).toHaveBeenCalledWith(
        GUILD_ID,
        USER_ID
      );
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenCalledWith(APPLICATION_ID, TOKEN, {
        content: messageList.birthday.not_found,
      });
    });

    it("should use the requester id if the user is not an admin delete the his birthday", async () => {
      const mockDelete = jest.fn();
      (checkAdmin as jest.Mock).mockReturnValueOnce(false);
      (getUserBirthday as jest.Mock).mockResolvedValueOnce({
        ...birthdayFixtureOne,
        delete: mockDelete,
      });

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "remove",
              options: removeCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(getUserBirthday).toHaveBeenCalledWith(
        GUILD_ID,
        USER_ID
      );
      expect(mockDelete).toHaveBeenCalled();
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenCalledWith(APPLICATION_ID, TOKEN, {
        content: messageList.birthday.remove_success,
      });
    });

    it("should use the requested id if the user is not an admin", async () => {
      const mockDelete = jest.fn();
      (checkAdmin as jest.Mock).mockReturnValueOnce(true);
      (getUserBirthday as jest.Mock).mockResolvedValueOnce({
        ...birthdayFixtureOne,
        delete: mockDelete,
      });

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "remove",
              options: removeCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(getUserBirthday).toHaveBeenCalledWith(
        GUILD_ID,
        REMOVE_BIRTHDAY_VALUES.user
      );
      expect(mockDelete).toHaveBeenCalled();
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenCalledWith(APPLICATION_ID, TOKEN, {
        content: messageList.birthday.remove_success,
      });
    });
  });

  describe("Get command", () => {
    it("should default to user and his own id when no parameters are given", async () => {
      (getUserBirthday as jest.Mock).mockResolvedValueOnce(
        birthdayFixtureOne
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "get",
            },
          ],
        },
      } as Interaction);

      expect(getUserBirthday).toHaveBeenCalledWith(
        GUILD_ID,
        USER_ID
      );
      expect(
        editOriginalInteractionResponse
      ).toBeCalledWith(APPLICATION_ID, TOKEN, {
        content: expect.any(String),
        allowed_mentions: no_mentions,
      });
    });

    it("should let the user know that no birthday was found for the given user", async () => {
      (getUserBirthday as jest.Mock).mockResolvedValueOnce(
        null
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "get",
              options: getUserCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(getUserBirthday).toHaveBeenCalledWith(
        GUILD_ID,
        GET_USER_BIRTHDAY_VALUES.user
      );
      expect(
        editOriginalInteractionResponse
      ).toBeCalledWith(APPLICATION_ID, TOKEN, {
        content: messageList.birthday.not_found,
      });
    });

    it("should show all the birthdays for a month", async () => {
      (
        getBirthdaysByMonth as jest.Mock
      ).mockResolvedValueOnce([]);
      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "get",
              options: getMonthCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(getBirthdaysByMonth).toHaveBeenCalled();
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenCalledWith(APPLICATION_ID, TOKEN, {
        content: expect.any(String),
        allowed_mentions: no_mentions,
      });
    });
  });

  describe("Server command", () => {
    it("should return the birth date of the server", async () => {
      (snowflakeToDate as jest.Mock).mockReturnValueOnce(
        new Date()
      );

      await commandCallback({
        ...baseCommand,
        data: {
          ...baseCommand.data,
          options: [
            {
              name: "server",
              options: addCommandOptions,
            },
          ],
        },
      } as Interaction);

      expect(snowflakeToDate).toHaveBeenCalledWith(
        GUILD_ID
      );
      expect(
        editOriginalInteractionResponse
      ).toHaveBeenCalledWith(APPLICATION_ID, TOKEN, {
        content: expect.any(String),
      });
    });
  });
});
