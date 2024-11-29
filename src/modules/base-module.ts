import { compareCommands } from "@/commands";
import { saveCommandHistory } from "@/database";
import { createCommand, createInteractionResponse } from "@/discord/rest";
import { ApplicationCommandAttachmentOption, ApplicationCommandBooleanOption, ApplicationCommandChannelOption, ApplicationCommandCreateRequest, ApplicationCommandIntegerOption, ApplicationCommandMentionableOption, ApplicationCommandNumberOption, ApplicationCommandResponse, ApplicationCommandRoleOption, ApplicationCommandStringOption, ApplicationCommandSubcommandGroupOption, ApplicationCommandSubcommandOption, ApplicationCommandUserOption, AvailableLocalesEnum } from "@/discord/rest/types.gen";
import { checkAdmin } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOption } from "@/helper/modules";
import { getApplication, setCommandExecutedCallback } from "@/state/store";

import { Prisma } from "@prisma/client";
import { JsonArray } from "@prisma/client/runtime/library";
import {
  APIApplicationCommandInteraction,
  APIApplicationCommandInteractionDataSubcommandOption,
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteractionData,
  APIMessageApplicationCommandInteraction,
  APIMessageComponentInteraction,
  APIMessageComponentInteractionData,
  APIModalSubmitInteraction,
  ApplicationCommandType,
  InteractionResponseType,
  LocalizationMap,
  MessageFlags
} from "discord-api-types/payloads/v10";

export type CommandHandler = (
  data: APIApplicationCommandInteraction,
  option: APIApplicationCommandInteractionDataSubcommandOption
) => Promise<void>;

export type ComponentCommandHandler = (
  data: APIModalSubmitInteraction | APIMessageComponentInteraction,
  subCommand: string[]
) => Promise<void>;

export type SingleCommandHandler = (
  data: APIApplicationCommandInteraction
) => Promise<void>;

export interface CommandInfo {
  definition: (ApplicationCommandAttachmentOption | ApplicationCommandBooleanOption | ApplicationCommandChannelOption | ApplicationCommandIntegerOption | ApplicationCommandMentionableOption | ApplicationCommandNumberOption | ApplicationCommandRoleOption | ApplicationCommandStringOption | ApplicationCommandSubcommandGroupOption | ApplicationCommandSubcommandOption | ApplicationCommandUserOption);
  handler: CommandHandler;
  componentHandler?: ComponentCommandHandler;
  isAdmin?: boolean;
}
interface SingleCommandInfo {
  definition: ApplicationCommandCreateRequest;
  handler: SingleCommandHandler;
  componentHandler?: ComponentCommandHandler;
  isAdmin?: boolean;
}

type LocaleMap = Record<string, string>;

export default class BaseModule {
  protected logger: Logger;

  protected commandName: LocaleMap = {};

  protected commandDescription: LocaleMap = {};

  protected commandType = ApplicationCommandType.ChatInput;

  protected commandList: Record<string, CommandInfo> = {};

  protected singleCommand: SingleCommandInfo | null = null;

  private isSetup = false;

  constructor (
    private _name: string,
    protected isActive: boolean,
    private _commandName: string = _name
  ) {
    this.logger = new Logger(_name);
    this.commandName["en-US"] = _name;
    this.commandDescription["en-US"] = _name;
  }

  private get commandDefinition (): ApplicationCommandCreateRequest {
    if (!this.singleCommand) {
      return {
        name: this.name,
        name_localizations: this.commandName,
        description: this.commandDescription["en-US"],
        description_localizations: this.commandDescription,
        type: this.commandType,
        options: Object.values(this.commandList).map((cmd) => cmd.definition ?? null)
      };
    }
    return this.singleCommand.definition;
  }

  private interactionExecuted = async (data: APIApplicationCommandInteraction): Promise<void> => {
    const interactionData = data.data;
    if (
      (interactionData?.name === this.name || interactionData?.name === this.singleCommand?.definition.name) &&
      (data.user || data.guild_id && data.member)
    ) {
      const app = getApplication();
      if (app?.id) {
        try {
          this.logger.debug("saving history");
          await saveCommandHistory({
            serverId: data.guild_id ?? null,
            channelId: data.channel.id ?? null,
            command: interactionData.name,
            data: (interactionData as APIChatInputApplicationCommandInteractionData).options as unknown as JsonArray,
            dateTime: new Date(),
            module: this._name,
            isComponent: false,
            userId: data.member?.user?.id ?? ""
          });
        } catch (e) {
          this.logger.error("Failed to create command history", {
            error: e,
            errorJson: JSON.stringify(e),
            isPrismaClientKnownRequestError:
              e instanceof Prisma.PrismaClientKnownRequestError,
            isPrismaClientUnknownRequestError:
              e instanceof Prisma.PrismaClientUnknownRequestError,
            isPrismaClientRustPanicError:
              e instanceof Prisma.PrismaClientRustPanicError,
            isPrismaClientInitializationError:
              e instanceof Prisma.PrismaClientInitializationError,
            isPrismaClientValidationError:
              e instanceof Prisma.PrismaClientValidationError,
            data: {
              serverId: data.guild_id ?? null,
              channelId: data.channel.id ?? null,
              command: data.data.name,
              data: (data.data as APIChatInputApplicationCommandInteractionData).options as unknown as JsonArray,
              dateTime: new Date(),
              module: this._name,
              isComponent: false,
              userId: data.member?.user?.id ?? ""
            }
          });
        }

        if (this.singleCommand) {
          if (
            this.singleCommand.isAdmin &&
            !await checkAdmin(data.guild_id, data.member)
          ) {
            await createInteractionResponse(data.id, data.token, {
              type: InteractionResponseType.ChannelMessageWithSource,
              data: {
                flags: MessageFlags.Ephemeral,
                content: messageList.common.no_permission
              }
            });
            return;
          }
          this.logger.info("CMD Executed", { data: data.data });
          return this.singleCommand.handler(data);
        }

        for (const cmd of Object.keys(this.commandList)) {
          const cmdData = getOption((data.data as APIChatInputApplicationCommandInteractionData).options, cmd);

          if (cmdData) {
            if (
              this.commandList[cmd].isAdmin &&
              !await checkAdmin(data.guild_id, data.member)
            ) {
              await createInteractionResponse(data.id, data.token, {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                  flags: MessageFlags.Ephemeral,
                  content: messageList.common.no_permission
                }
              });
              return;
            }

            this.logger.info("CMD Executed", { cmd,
              data: cmdData });
            return this.commandList[cmd].handler(data, cmdData as APIApplicationCommandInteractionDataSubcommandOption);
          }
        }

        const options = (data.data as APIChatInputApplicationCommandInteractionData).options?.[0];
        this.logger.error(
          "UNKNOWN COMMAND",
          options
        );
        await createInteractionResponse(data.id, data.token, {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            flags: MessageFlags.Ephemeral,
            content: messageList.common.internal_error
          }
        });
      }
    }
  };

  private executeOrLog (
    handler: ComponentCommandHandler | undefined,
    data: APIModalSubmitInteraction | APIMessageComponentInteraction,
    cmdData: string[] = []
  ) {
    if (!handler) {
      this.logger.error("Unexpected Component", data);
      return;
    }
    return handler(data, cmdData);
  }

  public interactionComponentExecute = async (data: APIModalSubmitInteraction | APIMessageComponentInteraction): Promise<void> => {
    if (data.data?.custom_id) {
      const app = getApplication();

      try {
        this.logger.debug("saving history");
        await saveCommandHistory({
          serverId: data.guild_id ?? null,
          channelId: data.channel?.id ?? null,
          command: data.data.custom_id,
          data: null,
          dateTime: new Date(),
          module: this._name,
          isComponent: true,
          userId: data.member?.user?.id ?? ""
        });
      } catch (e) {
        this.logger.error("Failed to create command history", {
          error: e,
          errorJson: JSON.stringify(e),
          isPrismaClientKnownRequestError:
            e instanceof Prisma.PrismaClientKnownRequestError,
          isPrismaClientUnknownRequestError:
            e instanceof Prisma.PrismaClientUnknownRequestError,
          isPrismaClientRustPanicError:
            e instanceof Prisma.PrismaClientRustPanicError,
          isPrismaClientInitializationError:
            e instanceof Prisma.PrismaClientInitializationError,
          isPrismaClientValidationError:
            e instanceof Prisma.PrismaClientValidationError,
          data: {
            serverId: data.guild_id ?? null,
            channelId: data.channel?.id ?? null,
            command: data.data.custom_id,
            data: null,
            dateTime: new Date(),
            module: this._name,
            isComponent: true,
            userId: data.member?.user?.id ?? ""
          }
        });
      }

      if (app?.id) {
        if (this.singleCommand) {
          return this.executeOrLog(this.singleCommand.componentHandler, data);
        }

        const idSplit = data.data.custom_id.split(".");
        for (const cmd of Object.keys(this.commandList)) {
          if (idSplit[1] === cmd) {
            const command = this.commandList[cmd];

            return this.executeOrLog(
              command.componentHandler,
              data,
              idSplit.slice(2)
            );
          }
        }
      }
    }

    this.logger.error("UNKNOWN INTERACTION COMPONENT", data?.data);
    await createInteractionResponse(data.id, data.token, {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        flags: MessageFlags.Ephemeral,
        content: messageList.common.internal_error
      }
    });
  };

  public get name () {
    return this._name;
  }

  public get cmdName () {
    return this._commandName;
  }

  public get active () {
    return this.isActive;
  }

  public setUp (): void {
    if (!this.isActive) {
      return;
    }
    if (!this.isSetup) {
      setCommandExecutedCallback(this.interactionExecuted);
      this.isSetup = true;
    }
  }

  public async upsertCommands (
    appId: string,
    discordCommand?: ApplicationCommandResponse
  ) {
    if (
      !discordCommand ||
      !compareCommands(this.commandDefinition, discordCommand)
    ) {
      this.logger.info("Creating command");
      await createCommand(appId, this.commandDefinition);
    }
  }

  public close () {
    this.isActive = false;
  }
}
