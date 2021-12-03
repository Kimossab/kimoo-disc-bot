import Pagination from "../helper/pagination";
import {
  Application,
  Guild,
  Interaction,
  MessageReactionAdd,
  MessageReactionRemove,
  User,
} from "../types/discord";
import { State } from "./types";

export const SET_USER = (
  state: State,
  user: User
): State => ({
  ...state,
  user,
});
export const ADD_GUILD = (
  state: State,
  guild: Guild
): State => {
  state.guilds = state.guilds.filter(
    (g) => g.id !== guild.id
  );
  state.guilds.push(guild);
  return state;
};

export const SET_APPLICATION = (
  state: State,
  application: Application
): State => ({
  ...state,
  ready: true,
  application,
});
export const SET_READY_CALLBACK = (
  state: State,
  callback: () => void
): State => ({
  ...state,
  readyCallback: callback,
});
export const SET_COMMAND_EXECUTED_CALLBACK = (
  state: State,
  callback: (data: Interaction) => void
): State => {
  state.commandExecutedCallback.push(callback);
  return state;
};

export const SET_REACTION_CALLBACK = (
  state: State,
  callback: (
    data: MessageReactionAdd | MessageReactionRemove,
    remove: boolean
  ) => void
): State => {
  state.messageReactionCallback.push(callback);
  return state;
};

export const ADD_PAGINATION = (
  state: State,
  data: Pagination<any>
): State => {
  state.allPaginations.push(data);
  return state;
};

export const SET_CHANNEL_LAST_ATTACHMENT = (
  state: State,
  channel: string,
  attachment: string
): State => {
  state.channelLastAttachment[channel] = attachment;
  return state;
};

export const SET_DISCORD_SESSION = (
  state: State,
  session: string | null
): State => ({
  ...state,
  discordSessionId: session,
});

export const SET_DISCORD_LAST_S = (
  state: State,
  lastS: number | null
): State => ({
  ...state,
  discordLastS: lastS,
});

export const REMOVE_PAGINATION = (
  state: State,
  data: Pagination<any>
): State => {
  const filtered = state.allPaginations.filter(
    (p) => p.message !== data.message
  );

  return {
    ...state,
    allPaginations: filtered,
  };
};
