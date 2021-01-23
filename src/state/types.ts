import Pagination from "../helper/pagination";

export const SET_USER = "SET_USER";
export const SET_APPLICATION = "SET_APPLICATION";
export const SET_READY_CALLBACK = "SET_READY_CALLBACK";
export const SET_COMMAND_EXECUTED_CALLBACK = "SET_COMMAND_EXECUTED_CALLBACK";
export const SET_REACTION_CALLBACK = "SET_REACTION_CALLBACK";
export const SET_CHANNEL_LAST_ATTACHMENT = "SET_CHANNEL_LAST_ATTACHMENT";
export const ADD_GUILD = "ADD_GUILD";
export const ADD_GUILD_MEMBERS = "ADD_GUILD_MEMBERS";
export const ADD_PAGINATION = "ADD_PAGINATION";

export interface State {
  ready: boolean;
  user: discord.user | null;
  application: discord.application_object | null;
  guilds: discord.guild[];
  allPaginations: Pagination<any>[];
  channelLastAttachment: string_object<string>;
  readyCallback: (() => void) | null;
  commandExecutedCallback: ((_: discord.interaction) => void)[];
  messageReactionCallback: ((
    _: discord.message_reaction_add | discord.message_reaction_remove,
    remove: boolean
  ) => void)[];
}

export interface SetUser {
  type: typeof SET_USER;
  user: discord.user;
}

export interface SetApplication {
  type: typeof SET_APPLICATION;
  application: discord.application_object;
}

export interface SetReadyCallback {
  type: typeof SET_READY_CALLBACK;
  callback: () => void;
}

export interface AddGuild {
  type: typeof ADD_GUILD;
  guild: discord.guild;
}

export interface AddGuildMembers {
  type: typeof ADD_GUILD_MEMBERS;
  guild: string;
  members: discord.guild_member[];
  clean: boolean;
}

export interface AddPagination {
  type: typeof ADD_PAGINATION;
  data: Pagination<any>;
}

export interface SetCommandExecutedCallback {
  type: typeof SET_COMMAND_EXECUTED_CALLBACK;
  callback: (data: discord.interaction) => void;
}

export interface SetReactionCallback {
  type: typeof SET_REACTION_CALLBACK;
  callback: (
    data: discord.message_reaction_add | discord.message_reaction_remove,
    remove: boolean
  ) => void;
}

export interface SetChannelLastAttachment {
  type: typeof SET_CHANNEL_LAST_ATTACHMENT;
  channel: string;
  attachment: string;
}

export type Actions =
  | SetUser
  | SetApplication
  | SetReadyCallback
  | SetCommandExecutedCallback
  | SetReactionCallback
  | SetChannelLastAttachment
  | AddGuild
  | AddGuildMembers
  | AddPagination;
