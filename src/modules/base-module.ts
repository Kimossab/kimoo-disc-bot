import { compareCommands } from "@/commands";
import { createCommand, createInteractionResponse } from "@/discord/rest";
import { checkAdmin } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOption } from "@/helper/modules";
import { getApplication, setCommandExecutedCallback } from "@/state/store";
import {
  ApplicationCommand,
  ApplicationCommandOption,
  ApplicationCommandType,
  AvailableLocales,
  CommandHandler,
  ComponentCommandHandler,
  CreateGlobalApplicationCommand,
  Interaction,
  InteractionCallbackDataFlags,
  InteractionCallbackType,
  Localization,
  SingleCommandHandler,
} from "@/types/discord";

export interface CommandInfo {
  definition: ApplicationCommandOption;
  handler: CommandHandler;
  componentHandler?: ComponentCommandHandler;
  isAdmin?: boolean;
}
interface SingleCommandInfo {
  definition: CreateGlobalApplicationCommand;
  handler: SingleCommandHandler;
  componentHandler?: ComponentCommandHandler;
  isAdmin?: boolean;
}

export default class BaseModule {
  protected logger: Logger;
  protected commandName: Localization = {};
  protected commandDescription: Localization = {};
  protected commandType = ApplicationCommandType.CHAT_INPUT;
  protected commandList: Record<string, CommandInfo> = {};
  protected singleCommand: SingleCommandInfo | null = null;
  private isSetup = false;

  constructor(
    private _name: string,
    protected isActive: boolean,
    private _commandName: string = _name
  ) {
    this.logger = new Logger(_name);
    this.commandName[AvailableLocales.English_US] = _name;
    this.commandDescription[AvailableLocales.English_US] = _name;
  }

  private get commandDefinition(): CreateGlobalApplicationCommand {
    if (!this.singleCommand) {
      return {
        name: this.name,
        name_localizations: this.commandName,
        description: this.commandDescription[AvailableLocales.English_US],
        description_localizations: this.commandDescription,
        type: this.commandType,
        options: Object.values(this.commandList).map((cmd) => cmd.definition),
      };
    }
    return this.singleCommand.definition;
  }

  private interactionExecuted = async (data: Interaction): Promise<void> => {
    if (
      data.data &&
      (data.data?.name === this.name ||
        data.data?.name === this.singleCommand?.definition.name) &&
      (data.user || (data.guild_id && data.member))
    ) {
      const app = getApplication();
      if (app && app.id) {
        if (this.singleCommand) {
          if (
            this.singleCommand.isAdmin &&
            !checkAdmin(data.guild_id, data.member)
          ) {
            await createInteractionResponse(data.id, data.token, {
              type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: InteractionCallbackDataFlags.EPHEMERAL,
                content: messageList.common.no_permission,
              },
            });
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
              await createInteractionResponse(data.id, data.token, {
                type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  flags: InteractionCallbackDataFlags.EPHEMERAL,
                  content: messageList.common.no_permission,
                },
              });
              return;
            }

            return this.commandList[cmd].handler(data, cmdData);
          }
        }

        const options = data.data?.options?.[0];
        this.logger.error(
          "UNKNOWN COMMAND",
          options?.name,
          options?.options,
          options?.value
        );
        await createInteractionResponse(data.id, data.token, {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionCallbackDataFlags.EPHEMERAL,
            content: messageList.common.internal_error,
          },
        });
      }
    }
  };

  public interactionComponentExecute = async (
    data: Interaction
  ): Promise<void> => {
    if (data.data && data.data.custom_id) {
      const app = getApplication();
      if (app && app.id) {
        if (this.singleCommand) {
          if (!this.singleCommand.componentHandler) {
            this.logger.error("Unexpected Component", data);
            return;
          }
          return this.singleCommand.componentHandler(data, []);
        }

        const idSplit = data.data.custom_id.split(".");

        for (const cmd of Object.keys(this.commandList)) {
          if (idSplit[1] === cmd) {
            const command = this.commandList[cmd];

            if (!command.componentHandler) {
              this.logger.error("Unexpected Component", data);
              return;
            }

            return command.componentHandler(data, idSplit.slice(2));
          }
        }

        const options = data.data?.options?.[0];
        this.logger.error(
          "UNKNOWN COMMAND",
          options?.name,
          options?.options,
          options?.value
        );
        await createInteractionResponse(data.id, data.token, {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionCallbackDataFlags.EPHEMERAL,
            content: messageList.common.internal_error,
          },
        });
      }
    }
    this.logger.log("component interaction", data);
  };

  public get name() {
    return this._name;
  }

  public get cmdName() {
    return this._commandName;
  }

  public get active() {
    return this.isActive;
  }

  public setUp(): void {
    if (!this.isActive) {
      return;
    }
    if (!this.isSetup) {
      setCommandExecutedCallback(this.interactionExecuted);
      this.isSetup = true;
    }
  }

  public async upsertCommands(
    appId: string,
    discordCommand?: ApplicationCommand
  ) {
    if (
      !discordCommand ||
      !compareCommands(this.commandDefinition, discordCommand)
    ) {
      this.logger.log("Creating command");
      await createCommand(appId, this.commandDefinition);
    }
  }
}
