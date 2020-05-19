import WebSocket from "ws";
import Helper from "../helper";
import { GATEWAY_OPCODES } from "../definitions";
import DB from "../database";
import Commands from "../commands";
import Weeb from "../modules/weeb";

/**
 * Class that handles all socket communications with Discord
 */
class DiscordSocket {
  private url: string;
  // private db: DB;

  private cmd: Commands;
  private weeb: Weeb;

  private client: WebSocket | null = null;
  private hbInterval: NodeJS.Timeout | null = null;
  private hbIntervalValue: number = 0;
  private lastS: number | null | undefined = null;
  private sessionId: string | null = null;

  private botUser: any = null;
  public guildList: any[] = [];

  /**
   * Initializes the necessary classes
   * ***
   * @param _url URL of socket server
   */
  constructor(_url: string) {
    this.url = _url;
    // this.db = _db;

    this.weeb = new Weeb();
    this.cmd = new Commands(this, this.weeb);
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
      console.log("error", e);
    }
  }

  // EVENTS
  /**
   * `(unused)` Handles `connection` event
   * ***
   * @param _ Event received
   */
  private onConnection(_: any) {
    // console.log("info", { name: "onConnection", data: e });
  }
  /**
   * `(unused)` Handles `open` event
   * ***
   * @param _ Event received
   */
  private onOpen(_: any) {
    // console.log("info", { name: "onOpen", data: e });
  }
  /**
   * Cleans up intervals and reconnects.
   * ***
   * @param _ Event received
   */
  private onClose(_: any) {
    console.log("closing...");
    // console.log("info", { name: "onClose", data: e });

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
    // console.log("info", { name: "onMessage", data: c });

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
        break;

      case "RESUMED":
        // console.log("RESUMED", data);
        break;

      case "CHANNEL_CREATE":
        console.log("CHANNEL_CREATE", JSON.stringify(data));
        break;
      case "CHANNEL_UPDATE":
        console.log("CHANNEL_UPDATE", JSON.stringify(data));
        break;
      case "CHANNEL_DELETE":
        console.log("CHANNEL_DELETE", JSON.stringify(data));
        break;
      case "CHANNEL_PINS_UPDATE":
        console.log("CHANNEL_PINS_UPDATE", JSON.stringify(data));
        break;
      case "GUILD_CREATE":
        // try {
        //   const settings = await this.db.loadServerSettings(data.d.id);
        //   console.log('GUILD_CREATE SETTINGS', settings);

        //   const serverData = {
        //     ...data.d,
        //     ...settings
        //   };
        //   this.guildList.push(serverData);

        //   //todo: add to db
        // } catch (e) {
        this.guildList.push(data.d);
        // console.log("GUILD_CREATE", e);
        // }
        break;
      case "GUILD_UPDATE":
        index = this.guildList.findIndex(g => data.d.id !== g.id);

        // try {
        //   const settings = await this.db.loadServerSettings(data.d.id);
        //   console.log('GUILD_UPDATE SETTINGS', settings);

        //   const serverData = {
        //     ...data.d,
        //     ...settings
        //   };
        //   this.guildList[index] = serverData;
        // } catch (e) {
        this.guildList[index] = data.d;
        // console.log("GUILD_UPDATE", e);
        // }
        break;
      case "GUILD_DELETE":
        this.guildList = this.guildList.filter(g => data.d.id !== g.id);
        break;
      case "GUILD_BAN_ADD":
        console.log("GUILD_BAN_ADD", JSON.stringify(data));
        break;
      case "GUILD_BAN_REMOVE":
        console.log("GUILD_BAN_REMOVE", JSON.stringify(data));
        break;
      case "GUILD_EMOJIS_UPDATE":
        console.log("GUILD_EMOJIS_UPDATE", JSON.stringify(data));
        break;
      case "GUILD_INTEGRATIONS_UPDATE":
        console.log("GUILD_INTEGRATIONS_UPDATE", JSON.stringify(data));
        break;
      case "GUILD_MEMBER_ADD":
        index = this.guildList.findIndex(g => data.d.guild_id === g.id);
        delete data.d.guild_id;

        if (this.guildList[index].members) {
          this.guildList[index].members!.push(data.d); // !. tells TS that this is in fact not undefined
        } else {
          this.guildList[index].members = [data.d];
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
        memberIndex = this.guildList[index].members!.findIndex(
          (m: any) => m.user.id === data.d.user.id
        );
        const user = this.guildList[index].members![memberIndex];

        delete data.d.guild_id;

        this.guildList[index].members![memberIndex] = { ...user, ...data.d };
        break;
      case "GUILD_MEMBER_CHUNK":
        console.log("GUILD_MEMBER_CHUNK", JSON.stringify(data));
        break;
      case "GUILD_ROLE_CREATE":
        console.log("GUILD_ROLE_CREATE", JSON.stringify(data));
        break;
      case "GUILD_ROLE_UPDATE":
        console.log("GUILD_ROLE_UPDATE", JSON.stringify(data));
        break;
      case "GUILD_ROLE_DELETE":
        console.log("GUILD_ROLE_DELETE", JSON.stringify(data));
        break;
      case "MESSAGE_CREATE":
        this.messageReceived(data.d);
        break;
      case "MESSAGE_UPDATE":
        // console.log("MESSAGE_UPDATE", JSON.stringify(data));
        break;
      case "MESSAGE_DELETE":
        console.log("MESSAGE_DELETE", JSON.stringify(data));
        break;
      case "MESSAGE_DELETE_BULK":
        console.log("MESSAGE_DELETE_BULK", JSON.stringify(data));
        break;
      case "MESSAGE_REACTION_ADD":
        if (this.botUser.id !== data.d.user_id) {
          this.weeb.handleReaction(data.d.message_id, data.d.channel_id, data.d.emoji.name);
        }
        break;
      case "MESSAGE_REACTION_REMOVE":
        if (this.botUser.id !== data.d.user_id) {
          this.weeb.handleReaction(data.d.message_id, data.d.channel_id, data.d.emoji.name);
        }
        break;
      case "MESSAGE_REACTION_REMOVE_ALL":
        console.log("MESSAGE_REACTION_REMOVE_ALL", JSON.stringify(data));
        break;
      case "PRESENCE_UPDATE":
        // console.log("PRESENCE_UPDATE", JSON.stringify(data));
        break;
      case "TYPING_START":
        // console.log("TYPING_START", JSON.stringify(data));
        break;
      case "USER_UPDATE":
        console.log("USER_UPDATE", JSON.stringify(data));
        break;
      case "VOICE_STATE_UPDATE":
        // console.log("VOICE_STATE_UPDATE", JSON.stringify(data));
        break;
      case "VOICE_SERVER_UPDATE":
        console.log("VOICE_SERVER_UPDATE", JSON.stringify(data));
        break;
      case "WEBHOOKS_UPDATE":
        console.log("WEBHOOKS_UPDATE", JSON.stringify(data));
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
    console.log("identifying...");
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
      // console.log("info", { name: "sendMessage", data: message });
      this.client.send(message);
    }
  }

  /**
   * Handles a new message created by a user (checks if it's a command and logs it)
   * ***
   * @param data Message received
   */
  private messageReceived(data: discord.message) {
    console.log(`[${new Date().toDateString()}] ${data.author.username}#${data.author.discriminator}: ${data.content}`);
    this.cmd.handle(data);

    data.attachments.forEach(file => {
      this.weeb.processAttachment(data.channel_id, file);
    });
  }

}

export default DiscordSocket;