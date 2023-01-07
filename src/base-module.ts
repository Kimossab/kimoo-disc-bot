import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "./discord/rest";
import Logger from "./helper/logger";
import {
  getApplication,
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
  protected commandList: Record<string, CommandInfo> = {};
  protected singleCommand: SingleCommandInfo | null = null;
  private isSetup = false;

  constructor(
    private name: string,
    private isActive: boolean
  ) {
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

  private interactionExecuted = async (
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

        const options = data.data?.options?.[0];
        this.logger.error(
          "UNKNOWN COMMAND",
          options?.name,
          options?.options,
          options?.value
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

  public setUp(): void {
    if (!this.isActive) {
      return;
    }
    if (!this.isSetup) {
      setCommandExecutedCallback(this.interactionExecuted);
      this.isSetup = true;
    }
  }
}
