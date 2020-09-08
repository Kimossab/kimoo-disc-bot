import WebSocket from "ws";
import Helper from "../helper";
import { GATEWAY_OPCODES } from "../definitions";
import DB from "../database";
// import Commands from "../commands";
// import Weeb from "../modules/weeb";
import Log from "../logger";
import ModuleManager from "../modules/ModuleManager";

/**
 * Class that handles all socket communications with Discord
 */
class DiscordSocket {
  private static _instance: DiscordSocket | null = null;

  private url: string;

  private client: WebSocket | null = null;
  private hbInterval: NodeJS.Timeout | null = null;
  private hbIntervalValue: number = 0;
  private lastS: number | null | undefined = null;
  private sessionId: string | null = null;

  private botUser: any = null;
  public guildList: discord.guild[] = [];

  public lastAttachments: string_object<string> = {};

  public static getInstance(): DiscordSocket | null {
    return DiscordSocket._instance;
  }

  public static setInstance(_url: string): DiscordSocket {
    if (!DiscordSocket._instance) {
      DiscordSocket._instance = new DiscordSocket(_url);
    }

    return DiscordSocket._instance;
  }

  public static clean() {
    DiscordSocket._instance = null;
  }

  /**
   * Initializes the necessary classes
   * ***
   * @param _url URL of socket server
   */
  constructor(_url: string) {
    this.url = _url;
  }

  /**
   * Connects to the socket server
   */
  public connect() {
    try {
      this.client = new WebSocket(this.url);

      this.client.on("connection", (e) => { this.onConnection(e); });
      this.client.on("open", (e: any) => { this.onOpen(e); });
      this.client.on("close", (e) => { this.onClose(e); });
      this.client.on("message", (e: string) => { this.onMessage(e); });
    } catch (e) {
      Log.write('socket', "error", e);
    }
  }

  // EVENTS
  /**
   * `(unused)` Handles `connection` event
   * ***
   * @param _ Event received
   */
  private onConnection(_: any) {
    // Log.write('socket', "info", { name: "onConnection", data: e });
  }
  /**
   * `(unused)` Handles `open` event
   * ***
   * @param _ Event received
   */
  private onOpen(_: any) {
    // Log.write('socket', "info", { name: "onOpen", data: e });
  }
  /**
   * Cleans up intervals and reconnects.
   * ***
   * @param _ Event received
   */
  private onClose(_: any) {
    Log.write('socket', "closing...");
    // Log.write('socket', "info", { name: "onClose", data: e });

    this.client = null;
    if (this.hbInterval) {
      clearInterval(this.hbInterval);
    }

    this.connect();
  };

  /**
   * Handles the received message
   * ***
   * @param c String received on message
   */
  private onMessage(c: string) {
    // Log.write('socket', "info", { name: "onMessage", data: c });

    const message = JSON.parse(c);
    const opCode = Number(message.op);

    switch (opCode) {
      case GATEWAY_OPCODES.DISPATCH:
        this.onDiscordEvent(message);
        break;
      case GATEWAY_OPCODES.HEARTBEAT:
        if (this.hbInterval) {
          clearInterval(this.hbInterval);
        }
        this.ping();
        break;
      case GATEWAY_OPCODES.RECONNECT:
        break;
      case GATEWAY_OPCODES.INVALID_SESSION:
        this.sessionId = null;
        this.lastS = null;
        setTimeout(() => { this.identify(); }, 5000);
        break;
      case GATEWAY_OPCODES.HELLO:
        this.onHello(message);
        break;
      case GATEWAY_OPCODES.HEARTBEAT_ACK:
        break;
    }
  }

  /**
   * Handles hello event.  
   * Starts Heartbeat interval and identifies the bot.  
   * ***
   * @param data Payload received from discord
   */
  private onHello(data: discord.gateway.payload) {
    this.hbIntervalValue = data.d.heartbeat_interval;
    this.ping();
    this.identify();
    this.hbInterval = setInterval(() => { this.ping(); }, this.hbIntervalValue);
  }

  /**
   * Handles event received from discord.  
   * ***
   * @param data Event information
   */
  private async onDiscordEvent(data: discord.gateway.payload) {
    // https://discordapp.com/developers/docs/topics/gateway#commands-and-events-gateway-events
    let index = null;
    let memberIndex = null;

    this.lastS = data.s;

    switch (data.t) {
      case "READY":
        this.botUser = data.d.user;
        this.sessionId = data.d.session_id;

        // Weeb.getInstance();
        break;

      case "RESUMED":
        // Log.write('socket', "RESUMED", data);
        break;

      case "CHANNEL_CREATE":
        Log.write('socket', "CHANNEL_CREATE", JSON.stringify(data));
        break;
      case "CHANNEL_UPDATE":
        Log.write('socket', "CHANNEL_UPDATE", JSON.stringify(data));
        break;
      case "CHANNEL_DELETE":
        Log.write('socket', "CHANNEL_DELETE", JSON.stringify(data));
        break;
      case "CHANNEL_PINS_UPDATE":
        Log.write('socket', "CHANNEL_PINS_UPDATE", JSON.stringify(data));
        break;
      case "GUILD_CREATE":
        try {
          const settings = await DB.getInstance().getServerData(data.d.id);

          const serverData = {
            ...data.d,
            ...settings
          };
          this.guildList.push(serverData);
        } catch (e) {
          this.guildList.push(data.d);
          Log.write('socket', "GUILD_CREATE", e);
        }
        break;
      case "GUILD_UPDATE":
        index = this.guildList.findIndex(g => data.d.id !== g.id);

        try {
          const settings = await DB.getInstance().getServerData(data.d.id);

          const serverData = {
            ...data.d,
            ...settings
          };
          this.guildList[index] = serverData;
        } catch (e) {
          this.guildList[index] = data.d;
          Log.write('socket', "GUILD_UPDATE", e);
        }
        break;
      case "GUILD_DELETE":
        this.guildList = this.guildList.filter(g => data.d.id !== g.id);
        break;
      case "GUILD_BAN_ADD":
        Log.write('socket', "GUILD_BAN_ADD", JSON.stringify(data));
        break;
      case "GUILD_BAN_REMOVE":
        Log.write('socket', "GUILD_BAN_REMOVE", JSON.stringify(data));
        break;
      case "GUILD_EMOJIS_UPDATE":
        Log.write('socket', "GUILD_EMOJIS_UPDATE", JSON.stringify(data));
        break;
      case "GUILD_INTEGRATIONS_UPDATE":
        Log.write('socket', "GUILD_INTEGRATIONS_UPDATE", JSON.stringify(data));
        break;
      case "GUILD_MEMBER_ADD":
        index = this.guildList.findIndex(g => data.d.guild_id === g.id);
        delete data.d.guild_id;

        if (index !== -1 && this.guildList[index]) {
          if (this.guildList[index].members) {
            this.guildList[index].members!.push(data.d); // !. tells TS that this is in fact not undefined
          } else {
            this.guildList[index].members = [data.d];
          }
        }
        break;
      case "GUILD_MEMBER_REMOVE":
        index = this.guildList.findIndex(g => data.d.guild_id === g.id);
        memberIndex = this.guildList[index].members!.findIndex(
          (m: any) => m.user.id === data.d.user.id
        );
        this.guildList[index].members!.splice(memberIndex, 1);
        break;
      case "GUILD_MEMBER_UPDATE":
        index = this.guildList.findIndex(g => data.d.guild_id === g.id);
        if (index !== -1 && this.guildList[index]) {
          memberIndex = this.guildList[index].members?.findIndex(
            (m: any) => m.user.id === data.d.user.id
          );

          if (!memberIndex) {
            return;
          }

          const user = this.guildList[index].members![memberIndex];

          delete data.d.guild_id;

          this.guildList[index].members![memberIndex] = { ...user, ...data.d };
        } else {
          Log.write('socket', 'couldn\'t find guild', index, this.guildList, data.d);
        }
        break;
      case "GUILD_MEMBER_CHUNK":
        Log.write('socket', "GUILD_MEMBER_CHUNK", JSON.stringify(data));
        break;
      case "GUILD_ROLE_CREATE":
        Log.write('socket', "GUILD_ROLE_CREATE", JSON.stringify(data));
        break;
      case "GUILD_ROLE_UPDATE":
        Log.write('socket', "GUILD_ROLE_UPDATE", JSON.stringify(data));
        break;
      case "GUILD_ROLE_DELETE":
        Log.write('socket', "GUILD_ROLE_DELETE", JSON.stringify(data));
        break;
      case "MESSAGE_CREATE":
        this.messageReceived(data.d);
        break;
      case "MESSAGE_UPDATE":
        // Log.write('socket', "MESSAGE_UPDATE", JSON.stringify(data));
        break;
      case "MESSAGE_DELETE":
        // Log.write('socket', "MESSAGE_DELETE", JSON.stringify(data));
        break;
      case "MESSAGE_DELETE_BULK":
        Log.write('socket', "MESSAGE_DELETE_BULK", JSON.stringify(data));
        break;
      case "MESSAGE_REACTION_ADD":
        if (this.botUser.id !== data.d.user_id) {
          // Weeb.getInstance().handleReaction(data.d.message_id, data.d.channel_id, data.d.emoji.name);
          ModuleManager.handleReaction(data.d.message_id, data.d.channel_id, data.d.emoji.name);
        }
        break;
      case "MESSAGE_REACTION_REMOVE":
        if (this.botUser.id !== data.d.user_id) {
          // Weeb.getInstance().handleReaction(data.d.message_id, data.d.channel_id, data.d.emoji.name);
          ModuleManager.handleReaction(data.d.message_id, data.d.channel_id, data.d.emoji.name);
        }
        break;
      case "MESSAGE_REACTION_REMOVE_ALL":
        Log.write('socket', "MESSAGE_REACTION_REMOVE_ALL", JSON.stringify(data));
        break;
      case "PRESENCE_UPDATE":
        // Log.write('socket', "PRESENCE_UPDATE", JSON.stringify(data));
        break;
      case "TYPING_START":
        // Log.write('socket', "TYPING_START", JSON.stringify(data));
        break;
      case "USER_UPDATE":
        Log.write('socket', "USER_UPDATE", JSON.stringify(data));
        break;
      case "VOICE_STATE_UPDATE":
        // Log.write('socket', "VOICE_STATE_UPDATE", JSON.stringify(data));
        break;
      case "VOICE_SERVER_UPDATE":
        Log.write('socket', "VOICE_SERVER_UPDATE", JSON.stringify(data));
        break;
      case "WEBHOOKS_UPDATE":
        Log.write('socket', "WEBHOOKS_UPDATE", JSON.stringify(data));
        break;
    }
  };

  // HELPER
  /**
   * Sends ping to discord
   */
  private ping = () => {
    this.send(JSON.stringify({ op: GATEWAY_OPCODES.HEARTBEAT, d: this.lastS }));
  }

  /**
   * Identifies the bot
   */
  private identify() {
    Log.write('socket', "identifying...");
    let data: discord.gateway.payload;
    if (!this.sessionId) {
      data = {
        op: GATEWAY_OPCODES.IDENTIFY,
        d: {
          token: process.env.TOKEN,
          properties: {
            $os: "windows10",
            $browser: "Kimoo",
            $device: "Kimoo"
          }
          // presence: {
          //   since: null,
          //   game: {
          //     name: "Hello world",
          //     type: 0
          //   },
          //   status: "online",
          //   afk: false
          // }
        }
      };
    } else {
      data = {
        op: GATEWAY_OPCODES.RESUME,
        d: {
          token: process.env.TOKEN,
          session_id: this.sessionId,
          seq: this.lastS
        }
      };
    }

    this.send(JSON.stringify(data));
  };

  /**
   * Sends a message through the socket.  
   * ***
   * @param message Message to be sent
   */
  private send(message: string) {
    if (this.client) {
      // Log.write('socket', "info", { name: "sendMessage", data: message });
      this.client.send(message);
    }
  }

  /**
   * Handles a new message created by a user (checks if it's a command and logs it)
   * ***
   * @param data Message received
   */
  private messageReceived(data: discord.message) {
    // Log.write('socket', `[${new Date().toDateString()}] ${data.author.username}#${data.author.discriminator}: ${data.content}`);
    // Commands.handle(data);

    ModuleManager.handleMessage(data);

    data.attachments.forEach(file => {
      this.lastAttachments[data.channel_id] = file.url;
      // Weeb.getInstance().processAttachment(data.channel_id, file);
    });
  }

}

export default DiscordSocket;