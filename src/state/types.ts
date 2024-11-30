import BaseModule from "#base-module";

import { InteractionPagination } from "@/helper/interaction-pagination";
import { APIApplicationCommandInteraction, APIGuildMember, APIUser, GatewayGuildCreateDispatchData, GatewayReadyDispatchData, APIInteraction } from "discord-api-types/v10";

type Application = GatewayReadyDispatchData["application"];

export enum ActionName {
  SetUser = "SET_USER",
  SetApplication = "SET_APPLICATION",
  SetResumeGateway = "SET_RESUME_GATEWAY",
  SetReadyCallback = "SET_READY_CALLBACK",
  SetCommandExecutedCallback = "SET_COMMAND_EXECUTED_CALLBACK",
  // SetReactionCallback = "SET_REACTION_CALLBACK",
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
    payload: APIUser;
    response: void;
    test: "test";
  };
  [ActionName.SetApplication]: {
    payload: GatewayReadyDispatchData["application"];
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
    payload: (data: APIApplicationCommandInteraction) => void;
    response: void;
  };
  // [ActionName.SetReactionCallback]: {
  //   payload: (
  //     data: MessageReactionAdd | MessageReactionRemove,
  //     remove: boolean
  //   ) => void;
  //   response: void;
  // };
  [ActionName.SetDiscordSession]: {
    payload: string | null;
    response: void;
  };
  [ActionName.SetDiscordLastS]: {
    payload: number | null;
    response: void;
  };
  [ActionName.AddGuild]: {
    payload: GatewayGuildCreateDispatchData;
    response: void;
  };
  [ActionName.AddGuildMembers]: {
    payload: {
      guild: string;
      members: APIGuildMember[];
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
    response: Application | null;
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
    payload: GatewayReadyDispatchData;
    response: void;
  };
  [ActionName.CommandExecuted]: {
    payload: APIInteraction;
    response: void;
  };
  [ActionName.SetModules]: {
    payload: BaseModule[];
    response: void;
  };
}

export interface State {
  ready: boolean;
  user: APIUser | null;
  application: Application | null;
  guilds: GatewayGuildCreateDispatchData[];
  allPaginations: InteractionPagination[];
  discordSessionId: string | null;
  discordLastS: number | null;
  resumeGatewayUrl: string;
  modules: BaseModule[];

  readyCallback: (() => void) | null;
  commandExecutedCallback: ((_: APIApplicationCommandInteraction) => void)[];
  messageReactionCallback: [];
}
