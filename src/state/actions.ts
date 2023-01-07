import {
  ADD_GUILD,
  SET_APPLICATION,
  SET_READY_CALLBACK,
  SET_COMMAND_EXECUTED_CALLBACK,
  SET_USER,
  ADD_PAGINATION,
  SET_REACTION_CALLBACK,
  SET_CHANNEL_LAST_ATTACHMENT,
  SET_DISCORD_SESSION,
  SET_DISCORD_LAST_S,
  REMOVE_PAGINATION,
  SET_RESUME_GATEWAY,
} from "./types";
import store from "./store";
import { DISCORD_TOKEN_TTL } from "../helper/constants";
import {
  Application,
  Guild,
  Interaction,
  InteractionType,
  MessageReactionAdd,
  MessageReactionRemove,
  Ready,
} from "../types/discord";
import { InteractionPagination } from "../helper/interaction-pagination";

/**
 * Adds a callback for when discord says it's ready
 * @param callback Callback function
 */
export const setReadyCallback = (
  callback: () => void
): void => {
  store.dispatch({
    type: SET_READY_CALLBACK,
    callback,
  });
};

/**
 * Checks if the application is ready
 */
export const isReady = (): boolean =>
  store.getState().ready;

/**
 * Sets all store variables and calls the callback when discord says it's ready
 * @param data Discord ready data
 */
export const setReadyData = (data: Ready): void => {
  store.dispatch({
    type: SET_USER,
    user: data.user,
  });

  store.dispatch({
    type: SET_APPLICATION,
    application: data.application,
  });

  store.dispatch({
    type: SET_RESUME_GATEWAY,
    resumeGateway: data.resume_gateway_url,
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
  callback: (data: Interaction) => void
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
export const commandExecuted = (
  data: Interaction
): void => {
  if (data.type === InteractionType.APPLICATION_COMMAND) {
    const callback =
      store.getState().commandExecutedCallback;

    for (const cb of callback) {
      cb(data);
    }
    return;
  }

  if (data.type === InteractionType.MESSAGE_COMPONENT) {
    if (
      data.message &&
      data.data?.custom_id?.startsWith("pagination.")
    ) {
      const pagination = getPagination(data.message.id);
      if (pagination) {
        pagination.handlePage(
          data.id,
          data.token,
          data.data
        );
      }
    } else {
      throw new Error("Unexpected component interaction");
    }
    return;
  }

  throw new Error("Unknown interaction type");
};

/**
 * Adds a new guild to the store
 * @param guild Guild information
 */
export const addGuild = (guild: Guild): void => {
  store.dispatch({
    type: ADD_GUILD,
    guild,
  });
};

/**
 * Get all guilds
 */
export const getGuilds = (): Guild[] =>
  store.getState().guilds;

/**
 * Get application info
 */
export const getApplication =
  (): Partial<Application> | null =>
    store.getState().application;

/**
 * Get gateway resume URL to be used for any reconnections
 */
export const getResumeGateway = (): string =>
  store.getState().resumeGatewayUrl;

/**
 * Add pagination to the store
 * @param data Pagination data
 */
export const addPagination = <T>(
  data: InteractionPagination<T>
): void => {
  store.dispatch({
    type: ADD_PAGINATION,
    data: data as InteractionPagination<unknown>,
  });

  setTimeout(() => {
    store.dispatch({
      type: REMOVE_PAGINATION,
      data: data as InteractionPagination<unknown>,
    });
  }, DISCORD_TOKEN_TTL);
};

export const getPagination = (
  messageId: string
): InteractionPagination<unknown> | undefined => {
  const state = store.getState();
  return state.allPaginations.find(
    (p) => p.messageId === messageId
  );
};

/**
 * Adds a callback for new reactions
 * @param callback Callback function
 */
export const setReactionCallback = (
  callback: (
    data: MessageReactionAdd | MessageReactionRemove,
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
  data: MessageReactionAdd | MessageReactionRemove,
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
export const getChannelLastAttachment = (
  channel: string
): string | undefined =>
  store.getState().channelLastAttachment[channel];

export const setDiscordSession = (
  session: string | null
): void => {
  store.dispatch({
    type: SET_DISCORD_SESSION,
    session,
  });
};

export const getDiscordSession = (): string | null =>
  store.getState().discordSessionId;

export const setDiscordLastS = (
  lastS: number | null
): void => {
  store.dispatch({
    type: SET_DISCORD_LAST_S,
    lastS,
  });
};

export const getDiscordLastS = (): number | null =>
  store.getState().discordLastS;
