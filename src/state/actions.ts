import { createAction } from "@reduxjs/toolkit";
import {
  Interaction,
  InteractionType,
  Ready,
} from "../types/discord";
import store from "./store";
import { ActionName, ActionPayload } from "./types";

const createStoreAction = <T extends ActionName>(name: T) =>
  createAction<ActionPayload[T]>(name);

export const setUser = createStoreAction(
  ActionName.SetUser
);
export const addGuild = createStoreAction(
  ActionName.AddGuild
);
export const setApplication = createStoreAction(
  ActionName.SetApplication
);
export const setResumeGateway = createStoreAction(
  ActionName.SetResumeGateway
);
export const setReadyCallback = createStoreAction(
  ActionName.SetReadyCallback
);
export const setCommandExecutedCallback = createStoreAction(
  ActionName.SetCommandExecutedCallback
);
export const setReactionCallback = createStoreAction(
  ActionName.SetReactionCallback
);
export const addPagination = createStoreAction(
  ActionName.AddPagination
);
export const setChannelLastAttachment = createStoreAction(
  ActionName.SetChannelLastAttachment
);
export const setDiscordSession = createStoreAction(
  ActionName.SetDiscordSession
);
export const setDiscordLastS = createStoreAction(
  ActionName.SetDiscordLastS
);
export const removePagination = createStoreAction(
  ActionName.RemovePagination
);

// Get data
export const getApplication = () =>
  store.getState().application;
export const getChannelLastAttachment = (channel: string) =>
  store.getState().channelLastAttachment[channel];
export const getGuilds = () => store.getState().guilds;
export const getResumeGateway = () =>
  store.getState().resumeGatewayUrl;
export const getDiscordSession = () =>
  store.getState().discordSessionId;
export const getPagination = (messageId: string) => {
  const state = store.getState();
  return state.allPaginations.find(
    (p) => p.messageId === messageId
  );
};
export const getDiscordLastS = () =>
  store.getState().discordLastS;

// Actions that gets and updates multiple fields
export const setReadyData = (data: Ready) => {
  setUser(data.user);
  setApplication(data.application);
  setResumeGateway(data.resume_gateway_url);

  const callback = store.getState().readyCallback;
  if (callback) {
    callback();
  }
};

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
