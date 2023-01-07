import {
  configureStore,
  createReducer,
} from "@reduxjs/toolkit";
import {
  setUser,
  addGuild,
  setApplication,
  setResumeGateway,
  setReadyCallback,
  setCommandExecutedCallback,
  setReactionCallback,
  addPagination,
  setChannelLastAttachment,
  setDiscordSession,
  setDiscordLastS,
  removePagination,
} from "./actions";
import { State } from "./types";

const initialState: State = {
  ready: false,
  user: null,
  application: null,
  guilds: [],
  allPaginations: [],
  discordSessionId: null,
  discordLastS: null,
  channelLastAttachment: {},
  readyCallback: null,
  commandExecutedCallback: [],
  messageReactionCallback: [],
  resumeGatewayUrl: "",
};

const reducer = createReducer(initialState, (builder) => {
  builder.addCase(setUser, (state, { payload }) => {
    state.user = payload;
  });

  builder.addCase(addGuild, (state, { payload }) => {
    state.guilds.push(payload);
  });

  builder.addCase(setApplication, (state, { payload }) => {
    state.ready = true;
    state.application = payload;
  });

  builder.addCase(
    setResumeGateway,
    (state, { payload }) => {
      state.resumeGatewayUrl = payload;
    }
  );

  builder.addCase(
    setReadyCallback,
    (state, { payload }) => {
      state.readyCallback = payload;
    }
  );

  builder.addCase(
    setCommandExecutedCallback,
    (state, { payload }) => {
      state.commandExecutedCallback.push(payload);
    }
  );

  builder.addCase(
    setReactionCallback,
    (state, { payload }) => {
      state.messageReactionCallback.push(payload);
    }
  );

  builder.addCase(addPagination, (state, { payload }) => {
    state.allPaginations.push(payload);
  });

  builder.addCase(
    setChannelLastAttachment,
    (state, { payload: { channel, attachment } }) => {
      state.channelLastAttachment[channel] = attachment;
    }
  );
  builder.addCase(
    setDiscordSession,
    (state, { payload }) => {
      state.discordSessionId = payload;
    }
  );

  builder.addCase(setDiscordLastS, (state, { payload }) => {
    state.discordLastS = payload;
  });

  builder.addCase(
    removePagination,
    (state, { payload }) => {
      state.allPaginations = state.allPaginations.filter(
        (pagination) =>
          pagination.messageId !== payload.messageId
      );
    }
  );
});

const store = configureStore({ reducer: reducer });

export default store;
