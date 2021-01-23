import {
  ADD_GUILD,
  SET_APPLICATION,
  SET_READY_CALLBACK,
  SET_COMMAND_EXECUTED_CALLBACK,
  SET_USER,
  ADD_PAGINATION,
  SET_REACTION_CALLBACK,
  SET_CHANNEL_LAST_ATTACHMENT,
} from "./types";
import store from "./store";
import Pagination from "../helper/pagination";

/**
 * Adds a callback for when discord says it's ready
 * @param callback Callback function
 */
export const setReadyCallback = (callback: () => void): void => {
  store.dispatch({
    type: SET_READY_CALLBACK,
    callback,
  });
};

/**
 * Checks if the application is ready
 */
export const isReady = (): boolean => {
  return store.getState().ready;
};

/**
 * Sets all store variables and calls the callback when discord says it's ready
 * @param data Discord ready data
 */
export const setReadyData = (data: discord.ready): void => {
  store.dispatch({
    type: SET_USER,
    user: data.user,
  });

  store.dispatch({
    type: SET_APPLICATION,
    application: data.application,
  });

  const callback = store.getState().readyCallback;
  if (callback) {
    callback();
  }
};

/**
 * Adds a callback for when discord receives a new command/interaction
 * @param callback Callback function
 */
export const setCommandExecutedCallback = (
  callback: (data: discord.interaction) => void
): void => {
  store.dispatch({
    type: SET_COMMAND_EXECUTED_CALLBACK,
    callback,
  });
};

/**
 * Runs all callbacks for commands
 * @param data Interaction data
 */
export const commandExecuted = (data: discord.interaction): void => {
  const callback = store.getState().commandExecutedCallback;

  for (const cb of callback) {
    cb(data);
  }
};

/**
 * Adds a new guild to the store
 * @param guild Guild information
 */
export const addGuild = (guild: discord.guild): void => {
  store.dispatch({
    type: ADD_GUILD,
    guild,
  });
};

/**
 * Get all guilds
 */
export const getGuilds = (): discord.guild[] => {
  return store.getState().guilds;
};

// export const addGuildMembers = (data: discord.guild_members_chunk): void => {
//   store.dispatch({
//     type: ADD_GUILD_MEMBERS,
//     guild: data.guild_id,
//     members: data.members,
//     clean: data.chunk_index === 0,
//   });
// };

// export const getUser = (): discord.user | null => {
//   return store.getState().user;
// };

// export const getGuildMembers = (
//   guild: string
// ): discord.guild_member[] | null => {
//   const gs = store.getState().guilds.filter((g) => g.id === guild);
//   if (gs) {
//     return gs[0].members ? gs[0].members : null;
//   }
//   return null;
// };

/**
 * Get application info
 */
export const getApplication = (): discord.application_object | null => {
  return store.getState().application;
};

/**
 * Add pagination to the store
 * @param data Pagination data
 */
export const addPagination = (data: Pagination<any>): void => {
  store.dispatch({
    type: ADD_PAGINATION,
    data,
  });
};

/**
 * Get pagination by message id
 * @param message Message id to find
 */
export const getPagination = (message: string): Pagination<any> | undefined => {
  return store.getState().allPaginations.find((f) => f.message === message);
};

/**
 * Adds a callback for new reactions
 * @param callback Callback function
 */
export const setReactionCallback = (
  callback: (
    data: discord.message_reaction_add | discord.message_reaction_remove,
    remove: boolean
  ) => void
): void => {
  store.dispatch({
    type: SET_REACTION_CALLBACK,
    callback,
  });
};

/**
 * Calls the reaction callbacks
 * @param data Reaction data
 * @param remove If the reaction was removed or added
 */
export const gotNewReaction = (
  data: discord.message_reaction_add | discord.message_reaction_remove,
  remove: boolean
): void => {
  const callback = store.getState().messageReactionCallback;

  for (const cb of callback) {
    cb(data, remove);
  }
};

/**
 * Stores the last attachment send in a channel
 * @param channel Channel id
 * @param attachment Attachment URL
 */
export const setChannelLastAttachment = (
  channel: string,
  attachment: string
): void => {
  store.dispatch({
    type: SET_CHANNEL_LAST_ATTACHMENT,
    channel,
    attachment,
  });
};

/**
 * Gets the last attachment sent to the channel
 * @param channel Channel id
 */
export const getChannelLastAttchment = (channel: string): string => {
  return store.getState().channelLastAttachment[channel];
};
