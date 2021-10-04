import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "./discord/rest";
import { interaction_response_type } from "./helper/constants";
import Logger from "./helper/logger";
import {
  getApplication,
  setCommandExecutedCallback,
} from "./state/actions";
import messageList from "./helper/messages";
import {
  getOption,
  getOptionValue,
} from "./helper/modules.helper";
import { checkAdmin } from "./helper/common";

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
    options?: discord.application_command_interaction_data_option[]
  ): T => {
    const response: T = {} as T;
    for (const key of optionKeys) {
      response[key] = getOptionValue(
        options,
        key as string
      ) as T[keyof T];
    }

    return response;
  };

  private commandExecuted = async (
    data: discord.interaction
  ): Promise<void> => {
    if (data.data && data.data.name === this.name) {
      const app = getApplication();
      if (app) {
        await createInteractionResponse(
          data.id,
          data.token,
          {
            type: interaction_response_type.acknowledge_with_source,
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

  public setUp(): void {
    if (!this.isSetup) {
      setCommandExecutedCallback(this.commandExecuted);
      this.isSetup = true;
    }
  }
}
