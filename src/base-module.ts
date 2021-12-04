import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "./discord/rest";
import Logger from "./helper/logger";
import {
  getApplication,
  getPagination,
  setCommandExecutedCallback,
} from "./state/actions";
import messageList from "./helper/messages";
import {
  getOption,
  getOptionValue,
} from "./helper/modules";
import { checkAdmin } from "./helper/common";
import {
  CommandInteractionDataOption,
  Interaction,
  InteractionCallbackType,
  InteractionType,
} from "./types/discord";

interface CommandInfo {
  handler: CommandHandler;
  isAdmin?: boolean;
}
interface SingleCommandInfo {
  handler: SingleCommandHandler;
  isAdmin?: boolean;
}

export default class BaseModule {
  protected logger: Logger;
  protected commandList: string_object<CommandInfo> = {};
  protected singleCommand: SingleCommandInfo | null = null;
  private name: string;
  private isSetup = false;

  constructor(name: string) {
    this.name = name;
    this.logger = new Logger(name);
  }

  protected getOptions = <T>(
    optionKeys: (keyof T)[],
    options?: CommandInteractionDataOption[]
  ): T => {
    const response: T = {} as T;
    for (const key of optionKeys) {
      response[key] = getOptionValue(
        options,
        key as string
      ) as unknown as T[keyof T];
    }

    return response;
  };

  private commandExecuted = async (
    data: Interaction
  ): Promise<void> => {
    if (
      data.data &&
      data.data.name === this.name &&
      data.guild_id &&
      data.member
    ) {
      const app = getApplication();
      if (app && app.id) {
        await createInteractionResponse(
          data.id,
          data.token,
          {
            type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          }
        );

        if (this.singleCommand) {
          if (
            this.singleCommand.isAdmin &&
            !checkAdmin(data.guild_id, data.member)
          ) {
            await editOriginalInteractionResponse(
              app.id,
              data.token,
              {
                content: messageList.common.no_permission,
              }
            );
            return;
          }
          return this.singleCommand.handler(data);
        }

        for (const cmd of Object.keys(this.commandList)) {
          const cmdData = getOption(data.data.options, cmd);

          if (cmdData) {
            if (
              this.commandList[cmd].isAdmin &&
              !checkAdmin(data.guild_id, data.member)
            ) {
              await editOriginalInteractionResponse(
                app.id,
                data.token,
                {
                  content: messageList.common.no_permission,
                }
              );
              return;
            }

            return this.commandList[cmd].handler(
              data,
              cmdData
            );
          }
        }

        this.logger.error(
          "UNKNOWN COMMAND",
          data.data!.options![0].name,
          data.data!.options![0].options,
          data.data!.options![0].value
        );
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.common.internal_error,
          }
        );
      }
    }
  };

  private componentInteraction = async (
    data: Interaction
  ): Promise<void> => {
    if (data.message?.interaction?.name === this.name) {
      if (data.data?.custom_id?.startsWith("pagination.")) {
        const pagination = getPagination(data.message.id);
        if (pagination) {
          this.logger.log("PAGINATION", data.data);
          pagination.handlePage(
            data.id,
            data.token,
            data.data
          );
          return;
        }
      }
    }
  };

  private interactionExecuted = async (
    data: Interaction
  ): Promise<void> => {
    if (data.type === InteractionType.APPLICATION_COMMAND) {
      this.commandExecuted(data);
    } else if (
      data.type === InteractionType.MESSAGE_COMPONENT
    ) {
      this.componentInteraction(data);
    }
  };

  public setUp(): void {
    if (!this.isSetup) {
      setCommandExecutedCallback(this.interactionExecuted);
      this.isSetup = true;
    }
  }
}
