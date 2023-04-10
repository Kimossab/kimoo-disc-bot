import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getApplication, setCommandExecutedCallback } from "@/state/store";
import { Interaction, InteractionCallbackType } from "@/types/discord";

import BaseModule from "./base-module";

const MODULE_NAME = "MODULE_NAME";
const APPLICATION_ID = "APPLICATION_ID";
const COMMAND_ID = "COMMAND_ID";
const TOKEN = "TOKEN";

let commandCallback: (data: Interaction) => Promise<void>;

//mocks
jest.mock("./state/store");
const mockGetApplication = getApplication as jest.Mock;
const mockSetCommandExecutedCallback =
  setCommandExecutedCallback as unknown as jest.Mock;
mockGetApplication.mockReturnValue({
  id: APPLICATION_ID,
});
mockSetCommandExecutedCallback.mockImplementation(
  (callback: (data: Interaction) => Promise<void>) => {
    commandCallback = callback;
  }
);

jest.mock("./discord/rest");
const mockCreateInteractionResponse = createInteractionResponse as jest.Mock;
const mockEditOriginalInteractionResponse =
  editOriginalInteractionResponse as jest.Mock;

const mockLog = jest.fn();
const mockError = jest.fn();
jest.mock("./helper/logger");
(Logger as jest.Mock).mockImplementation(() => ({
  log: mockLog,
  error: mockError,
}));

jest.mock("./helper/common");

describe("Base Module", () => {
  let module: BaseModule;
  beforeAll(() => {
    module = new BaseModule(MODULE_NAME, true);
    module.setUp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Command for a different module", () => {
    it("must ignore the command", async () => {
      await commandCallback({
        data: {
          name: "invalid_module",
        },
      } as Interaction);

      expect(mockGetApplication).not.toHaveBeenCalled();
      expect(mockCreateInteractionResponse).not.toHaveBeenCalled();
    });
  });

  describe("App is not properly running", () => {
    it("must ignore the command", async () => {
      mockGetApplication.mockReturnValueOnce(null);

      await commandCallback({
        data: {
          name: MODULE_NAME,
        },
      } as Interaction);

      expect(mockGetApplication).toHaveBeenCalled();
      expect(mockCreateInteractionResponse).not.toHaveBeenCalled();
    });
  });

  describe("Unknown command", () => {
    it("should acknowledge the command", async () => {
      await commandCallback({
        id: COMMAND_ID,
        token: TOKEN,
        data: {
          name: MODULE_NAME,
          options: [{ name: "invalid_command" }],
        },
      } as Interaction);

      expect(mockCreateInteractionResponse).toHaveBeenCalledWith(
        COMMAND_ID,
        TOKEN,
        {
          type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        }
      );

      expect(mockError).toHaveBeenCalledWith(
        "UNKNOWN COMMAND",
        "invalid_command",
        undefined,
        undefined
      );

      expect(mockEditOriginalInteractionResponse).toHaveBeenCalledWith(
        APPLICATION_ID,
        TOKEN,
        {
          content: messageList.common.internal_error,
        }
      );
    });
  });

  // describe("Admin and callback", () => {
  //   const adminHandler = jest.fn();
  //   const noAdminHandler = jest.fn();

  //   class TestModuleClass extends BaseModule {
  //     constructor() {
  //       super("test", true);
  //       this.commandList = {
  //         admin: {
  //           handler: adminHandler,
  //           isAdmin: true,
  //         },
  //         noAdmin: {
  //           handler: noAdminHandler,
  //           isAdmin: false,
  //         },
  //       };
  //     }
  //   }

  //   let testModule: TestModuleClass;

  //   beforeAll(() => {
  //     testModule = new TestModuleClass();
  //     testModule.setUp();
  //   });

  //   it("should let the user know he doesn't have permission", async () => {
  //     mockCheckAdmin.mockReturnValueOnce(false);

  //     await commandCallback({
  //       id: COMMAND_ID,
  //       token: TOKEN,
  //       data: {
  //         name: "test",
  //         options: [{ name: "admin" }],
  //       },
  //     } as Interaction);

  //     expect(noAdminHandler).not.toHaveBeenCalled();
  //     expect(adminHandler).not.toHaveBeenCalled();
  //     expect(mockEditOriginalInteractionResponse).toHaveBeenCalledWith(
  //       APPLICATION_ID,
  //       TOKEN,
  //       {
  //         content: messageList.common.no_permission,
  //       }
  //     );
  //   });

  //   it("should check if the user has permission and call the handler", async () => {
  //     mockCheckAdmin.mockReturnValueOnce(true);

  //     await commandCallback({
  //       id: COMMAND_ID,
  //       token: TOKEN,
  //       data: {
  //         name: "test",
  //         options: [{ name: "admin" }],
  //       },
  //     } as Interaction);

  //     expect(mockCheckAdmin).toHaveBeenCalled();
  //     expect(adminHandler).toHaveBeenCalled();
  //     expect(noAdminHandler).not.toHaveBeenCalled();
  //   });

  //   it("should call the handler", async () => {
  //     await commandCallback({
  //       id: COMMAND_ID,
  //       token: TOKEN,
  //       data: {
  //         name: "test",
  //         options: [{ name: "noAdmin" }],
  //       },
  //     } as Interaction);

  //     expect(adminHandler).not.toHaveBeenCalled();
  //     expect(noAdminHandler).toHaveBeenCalled();
  //   });
  // });
});
