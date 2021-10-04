import Pagination from "../helper/pagination";
import { State } from "./types";

export const SET_USER = (
  state: State,
  user: discord.user
): State => ({
  ...state,
  user,
});
export const ADD_GUILD = (
  state: State,
  guild: discord.guild
): State => {
  state.guilds = state.guilds.filter(
    (g) => g.id !== guild.id
  );
  state.guilds.push(guild);
  return state;
};
// export const ADD_GUILD_MEMBERS = (
//   state: State,
//   guild: string,
//   clean: boolean,
//   members: discord.guild_member[]
// ): State => {
//   const gs = state.guilds.filter((g) => g.id === guild);
//   if (gs.length) {
//     if (!gs[0].members || clean) {
//       gs[0].members = [];
//     }
//     gs[0].members = [...gs[0].members!, ...members];
//   }
//   return state;
// };
export const SET_APPLICATION = (
  state: State,
  application: discord.application_object
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
  callback: (data: discord.interaction) => void
): State => {
  state.commandExecutedCallback.push(callback);
  return state;
};

export const SET_REACTION_CALLBACK = (
  state: State,
  callback: (
    data:
      | discord.message_reaction_add
      | discord.message_reaction_remove,
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
