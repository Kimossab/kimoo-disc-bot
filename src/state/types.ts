import BaseModule from "#base-module";

import { InteractionPagination } from "@/helper/interaction-pagination";
import {
  Application,
  Guild,
  GuildMember,
  Interaction,
  InteractionData,
  MessageComponentInteractionData,
  MessageReactionAdd,
  MessageReactionRemove,
  ModalSubmitInteractionData,
  Ready,
  User
} from "@/types/discord";

export enum ActionName {
  SetUser = "SET_USER",
  SetApplication = "SET_APPLICATION",
  SetResumeGateway = "SET_RESUME_GATEWAY",
  SetReadyCallback = "SET_READY_CALLBACK",
  SetCommandExecutedCallback = "SET_COMMAND_EXECUTED_CALLBACK",
  SetReactionCallback = "SET_REACTION_CALLBACK",
  SetDiscordSession = "SET_DISCORD_SESSION",
  SetDiscordLastS = "SET_DISCORD_LAST_S",
  AddGuild = "ADD_GUILD",
  AddGuildMembers = "ADD_GUILD_MEMBERS",
  AddPagination = "ADD_PAGINATION",
  RemovePagination = "REMOVE_PAGINATION",

  SetReadyData = "SET_READY_DATA",
  CommandExecuted = "COMMAND_EXECUTED",

  GetApplication = "GET_APPLICATION",
  GetGuilds = "GET_GUILDS",
  GetResumeGateway = "GET_RESUME_GATEWAY",
  GetDiscordSession = "GET_DISCORD_SESSION",
  GetDiscordLastS = "GET_DISCORD_LAST_S",
  GetPagination = "GET_PAGINATION",

  SetModules = "SET_MODULES"
}

interface ActionData {
  payload: unknown;
  response: unknown;
}

export interface Actions extends Record<string, ActionData> {
  [ActionName.SetUser]: {
    payload: User;
    response: void;
    test: "test";
  };
  [ActionName.SetApplication]: {
    payload: Partial<Application>;
    response: void;
  };
  [ActionName.SetResumeGateway]: {
    payload: string;
    response: void;
  };
  [ActionName.SetReadyCallback]: {
    payload: () => Promise<void>;
    response: void;
  };
  [ActionName.SetCommandExecutedCallback]: {
    payload: (data: Interaction<InteractionData>) => void;
    response: void;
  };
  [ActionName.SetReactionCallback]: {
    payload: (
      data: MessageReactionAdd | MessageReactionRemove,
      remove: boolean
    ) => void;
    response: void;
  };
  [ActionName.SetDiscordSession]: {
    payload: string | null;
    response: void;
  };
  [ActionName.SetDiscordLastS]: {
    payload: number | null;
    response: void;
  };
  [ActionName.AddGuild]: { payload: Guild; response: void };
  [ActionName.AddGuildMembers]: {
    payload: {
      guild: string;
      members: GuildMember[];
      clean: boolean;
    };
    response: void;
  };
  [ActionName.AddPagination]: {
    payload: InteractionPagination;
    response: void;
  };
  [ActionName.RemovePagination]: {
    payload: InteractionPagination;
    response: void;
  };
  [ActionName.GetApplication]: {
    payload: undefined;
    response: State["application"];
  };
  [ActionName.GetGuilds]: {
    payload: undefined;
    response: State["guilds"];
  };
  [ActionName.GetResumeGateway]: {
    payload: undefined;
    response: State["resumeGatewayUrl"];
  };
  [ActionName.GetDiscordSession]: {
    payload: undefined;
    response: State["discordSessionId"];
  };
  [ActionName.GetDiscordLastS]: {
    payload: undefined;
    response: State["discordLastS"];
  };
  [ActionName.GetPagination]: {
    payload: string;
    response: InteractionPagination | undefined;
  };
  [ActionName.SetReadyData]: {
    payload: Ready;
    response: void;
  };
  [ActionName.CommandExecuted]: {
    payload: Interaction<
      | InteractionData
      | MessageComponentInteractionData
      | ModalSubmitInteractionData
    >;
    response: void;
  };
  [ActionName.SetModules]: {
    payload: BaseModule[];
    response: void;
  };
}

export interface State {
  ready: boolean;
  user: User | null;
  application: Partial<Application> | null;
  guilds: Guild[];
  allPaginations: InteractionPagination[];
  discordSessionId: string | null;
  discordLastS: number | null;
  resumeGatewayUrl: string;
  modules: BaseModule[];

  readyCallback: (() => void) | null;
  commandExecutedCallback: ((_: Interaction<InteractionData>) => void)[];
  messageReactionCallback: ((
    _: MessageReactionAdd | MessageReactionRemove,
    remove: boolean
  ) => void)[];
}
