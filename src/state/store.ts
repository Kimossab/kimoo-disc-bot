import { InteractionType } from "../types/discord";
import { ActionName, Actions, State } from "./types";

const state: State = {
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

type StateActions = {
  [key in ActionName]: Actions[key]["payload"] extends undefined
    ? () => Actions[key]["response"]
    : (
        payload: Actions[key]["payload"]
      ) => Actions[key]["response"];
};

const actions: StateActions = {
  [ActionName.SetUser]: (payload) => {
    state.user = payload;
    return state;
  },
  [ActionName.AddGuild]: (payload) => {
    state.guilds.push(payload);
    return state;
  },
  [ActionName.SetApplication]: (payload) => {
    state.ready = true;
    state.application = payload;
    return state;
  },
  [ActionName.SetResumeGateway]: (payload) => {
    state.resumeGatewayUrl = payload;
    return state;
  },
  [ActionName.SetReadyCallback]: (payload) => {
    state.readyCallback = payload;
    return state;
  },
  [ActionName.SetCommandExecutedCallback]: (payload) => {
    state.commandExecutedCallback.push(payload);
    return state;
  },
  [ActionName.SetReactionCallback]: (payload) => {
    state.messageReactionCallback.push(payload);
    return state;
  },
  [ActionName.SetChannelLastAttachment]: ({
    channel,
    attachment,
  }) => {
    state.channelLastAttachment[channel] = attachment;
    return state;
  },
  [ActionName.SetDiscordSession]: (payload) => {
    state.discordSessionId = payload;
    return state;
  },
  [ActionName.SetDiscordLastS]: (payload) => {
    state.discordLastS = payload;
    return state;
  },
  [ActionName.AddGuild]: (payload) => {
    state.guilds.push(payload);
    return state;
  },
  [ActionName.AddGuildMembers]: ({
    guild: guildId,
    members,
    clean,
  }) => {
    const guild = state.guilds.find(
      (g) => g.id === guildId
    );
    if (!guild) {
      return state;
    }
    if (clean) {
      guild.members = [];
    }
    guild.members = (guild.members ?? []).concat(members);
    return state;
  },
  [ActionName.AddPagination]: (payload) => {
    state.allPaginations.push(payload);
    return state;
  },
  [ActionName.RemovePagination]: (payload) => {
    state.allPaginations = state.allPaginations.filter(
      (pagination) =>
        pagination.messageId !== payload.messageId
    );
    return state;
  },
  [ActionName.GetApplication]: () => state.application,
  [ActionName.GetChannelLastAttachment]: (channel) =>
    state.channelLastAttachment[channel],
  [ActionName.GetGuilds]: () => state.guilds,
  [ActionName.GetResumeGateway]: () =>
    state.resumeGatewayUrl,
  [ActionName.GetDiscordSession]: () =>
    state.discordSessionId,
  [ActionName.GetPagination]: (messageId) =>
    state.allPaginations.find(
      (p) => p.messageId === messageId
    ),
  [ActionName.GetDiscordLastS]: () => state.discordLastS,
  [ActionName.SetReadyData]: (data) => {
    setUser(data.user);
    setApplication(data.application);
    setResumeGateway(data.resume_gateway_url);

    const callback = state.readyCallback;
    if (callback) {
      callback();
    }
  },
  [ActionName.CommandExecuted]: (data) => {
    if (data.type === InteractionType.APPLICATION_COMMAND) {
      const callback = state.commandExecutedCallback;

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
  },
};

export const setUser = actions[ActionName.SetUser];
export const addGuild = actions[ActionName.AddGuild];
export const setApplication =
  actions[ActionName.SetApplication];
export const setResumeGateway =
  actions[ActionName.SetResumeGateway];
export const setReadyCallback =
  actions[ActionName.SetReadyCallback];
export const setCommandExecutedCallback =
  actions[ActionName.SetCommandExecutedCallback];
export const setReactionCallback =
  actions[ActionName.SetReactionCallback];
export const addPagination =
  actions[ActionName.AddPagination];
export const setChannelLastAttachment =
  actions[ActionName.SetChannelLastAttachment];
export const setDiscordSession =
  actions[ActionName.SetDiscordSession];
export const setDiscordLastS =
  actions[ActionName.SetDiscordLastS];
export const removePagination =
  actions[ActionName.RemovePagination];
export const getApplication =
  actions[ActionName.GetApplication];
export const getChannelLastAttachment =
  actions[ActionName.GetChannelLastAttachment];
export const getGuilds = actions[ActionName.GetGuilds];
export const getResumeGateway =
  actions[ActionName.GetResumeGateway];
export const getDiscordSession =
  actions[ActionName.GetDiscordSession];
export const getPagination =
  actions[ActionName.GetPagination];
export const getDiscordLastS =
  actions[ActionName.GetDiscordLastS];
export const setReadyData =
  actions[ActionName.SetReadyData];
export const commandExecuted =
  actions[ActionName.CommandExecuted];
