import { createStore } from 'redux';
import {
  Actions,
  State,
  SET_USER,
  ADD_GUILD,
  ADD_GUILD_MEMBERS,
  SET_APPLICATION,
  SET_READY_CALLBACK,
  SET_COMMAND_EXECUTED_CALLBACK,
  ADD_PAGINATION,
  SET_REACTION_CALLBACK,
  SET_CHANNEL_LAST_ATTACHMENT,
  SET_DISCORD_SESSION,
  SET_DISCORD_LAST_S,
  REMOVE_PAGINATION,
} from './types';
import * as handler from './handler';

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
};

const storeReducer = (state: State = initialState, action: Actions) => {
  switch (action.type) {
    case SET_USER:
      return handler.SET_USER(state, action.user);
    case ADD_GUILD:
      return handler.ADD_GUILD(state, action.guild);
    // case ADD_GUILD_MEMBERS:
    //   return handler.ADD_GUILD_MEMBERS(
    //     state,
    //     action.guild,
    //     action.clean,
    //     action.members
    //   );
    case SET_APPLICATION:
      return handler.SET_APPLICATION(state, action.application);
    case SET_READY_CALLBACK:
      return handler.SET_READY_CALLBACK(state, action.callback);
    case SET_COMMAND_EXECUTED_CALLBACK:
      return handler.SET_COMMAND_EXECUTED_CALLBACK(state, action.callback);
    case SET_REACTION_CALLBACK:
      return handler.SET_REACTION_CALLBACK(state, action.callback);
    case ADD_PAGINATION:
      return handler.ADD_PAGINATION(state, action.data);
    case SET_CHANNEL_LAST_ATTACHMENT:
      return handler.SET_CHANNEL_LAST_ATTACHMENT(
        state,
        action.channel,
        action.attachment
      );
    case SET_DISCORD_SESSION:
      return handler.SET_DISCORD_SESSION(state, action.session);
    case SET_DISCORD_LAST_S:
      return handler.SET_DISCORD_LAST_S(state, action.lastS);
    case REMOVE_PAGINATION:
      return handler.REMOVE_PAGINATION(state, action.data);
    default:
      return state;
  }
};

const store = createStore(storeReducer);

export default store;
