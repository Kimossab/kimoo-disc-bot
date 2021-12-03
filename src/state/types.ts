import Pagination from "../helper/pagination";
import {
  Application,
  GuildMember,
  Interaction,
  MessageReactionAdd,
  MessageReactionRemove,
  User,
} from "../types/discord";

export const SET_USER = "SET_USER";
export const SET_APPLICATION = "SET_APPLICATION";
export const SET_READY_CALLBACK = "SET_READY_CALLBACK";
export const SET_COMMAND_EXECUTED_CALLBACK =
  "SET_COMMAND_EXECUTED_CALLBACK";
export const SET_REACTION_CALLBACK =
  "SET_REACTION_CALLBACK";
export const SET_CHANNEL_LAST_ATTACHMENT =
  "SET_CHANNEL_LAST_ATTACHMENT";
export const SET_DISCORD_SESSION = "SET_DISCORD_SESSION";
export const SET_DISCORD_LAST_S = "SET_DISCORD_LAST_S";
export const ADD_GUILD = "ADD_GUILD";
export const ADD_GUILD_MEMBERS = "ADD_GUILD_MEMBERS";
export const ADD_PAGINATION = "ADD_PAGINATION";
export const REMOVE_PAGINATION = "REMOVE_PAGINATION";

export interface State {
  ready: boolean;
  user: User | null;
  application: Application | null;
  guilds: Guild[];
  allPaginations: Pagination<unknown>[];
  channelLastAttachment: string_object<string>;
  discordSessionId: string | null;
  discordLastS: number | null;

  readyCallback: (() => void) | null;
  commandExecutedCallback: ((_: Interaction) => void)[];
  messageReactionCallback: ((
    _: MessageReactionAdd | MessageReactionRemove,
    remove: boolean
  ) => void)[];
}

export interface SetUser {
  type: typeof SET_USER;
  user: User;
}

export interface SetApplication {
  type: typeof SET_APPLICATION;
  application: Application;
}

export interface SetReadyCallback {
  type: typeof SET_READY_CALLBACK;
  callback: () => void;
}

export interface AddGuild {
  type: typeof ADD_GUILD;
  guild: Guild;
}

export interface AddGuildMembers {
  type: typeof ADD_GUILD_MEMBERS;
  guild: string;
  members: GuildMember[];
  clean: boolean;
}

export interface AddPagination {
  type: typeof ADD_PAGINATION;
  data: Pagination<unknown>;
}

export interface RemovePagination {
  type: typeof REMOVE_PAGINATION;
  data: Pagination<unknown>;
}

export interface SetCommandExecutedCallback {
  type: typeof SET_COMMAND_EXECUTED_CALLBACK;
  callback: (data: Interaction) => void;
}

export interface SetReactionCallback {
  type: typeof SET_REACTION_CALLBACK;
  callback: (
    data: MessageReactionAdd | MessageReactionRemove,
    remove: boolean
  ) => void;
}

export interface SetChannelLastAttachment {
  type: typeof SET_CHANNEL_LAST_ATTACHMENT;
  channel: string;
  attachment: string;
}

export interface SetDiscordSession {
  type: typeof SET_DISCORD_SESSION;
  session: string | null;
}

export interface SetDiscordLastS {
  type: typeof SET_DISCORD_LAST_S;
  lastS: number | null;
}

export type Actions =
  | SetUser
  | SetApplication
  | SetReadyCallback
  | SetCommandExecutedCallback
  | SetReactionCallback
  | SetChannelLastAttachment
  | SetDiscordSession
  | SetDiscordLastS
  | AddGuild
  | AddGuildMembers
  | AddPagination
  | RemovePagination;
