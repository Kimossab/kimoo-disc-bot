import { InteractionPagination } from "../helper/interaction-pagination";
import {
  Application,
  Guild,
  GuildMember,
  Interaction,
  MessageReactionAdd,
  MessageReactionRemove,
  User,
} from "../types/discord";

export enum ActionName {
  SetUser = "SET_USER",
  SetApplication = "SET_APPLICATION",
  SetResumeGateway = "SET_RESUME_GATEWAY",
  SetReadyCallback = "SET_READY_CALLBACK",
  SetCommandExecutedCallback = "SET_COMMAND_EXECUTED_CALLBACK",
  SetReactionCallback = "SET_REACTION_CALLBACK",
  SetChannelLastAttachment = "SET_CHANNEL_LAST_ATTACHMENT",
  SetDiscordSession = "SET_DISCORD_SESSION",
  SetDiscordLastS = "SET_DISCORD_LAST_S",
  AddGuild = "ADD_GUILD",
  AddGuildMembers = "ADD_GUILD_MEMBERS",
  AddPagination = "ADD_PAGINATION",
  RemovePagination = "REMOVE_PAGINATION",
}

export interface ActionPayload {
  [ActionName.SetUser]: User;
  [ActionName.SetApplication]: Partial<Application>;
  [ActionName.SetResumeGateway]: string;
  [ActionName.SetReadyCallback]: () => void;
  [ActionName.SetCommandExecutedCallback]: (
    data: Interaction
  ) => void;
  [ActionName.SetReactionCallback]: (
    data: MessageReactionAdd | MessageReactionRemove,
    remove: boolean
  ) => void;
  [ActionName.SetChannelLastAttachment]: {
    channel: string;
    attachment: string;
  };
  [ActionName.SetDiscordSession]: string | null;
  [ActionName.SetDiscordLastS]: number | null;
  [ActionName.AddGuild]: Guild;
  [ActionName.AddGuildMembers]: {
    guild: string;
    members: GuildMember[];
    clean: boolean;
  };
  [ActionName.AddPagination]: InteractionPagination;
  [ActionName.RemovePagination]: InteractionPagination;
}

export interface State {
  ready: boolean;
  user: User | null;
  application: Partial<Application> | null;
  guilds: Guild[];
  allPaginations: InteractionPagination[];
  channelLastAttachment: Record<string, string>;
  discordSessionId: string | null;
  discordLastS: number | null;
  resumeGatewayUrl: string;

  readyCallback: (() => void) | null;
  commandExecutedCallback: ((_: Interaction) => void)[];
  messageReactionCallback: ((
    _: MessageReactionAdd | MessageReactionRemove,
    remove: boolean
  ) => void)[];
}
