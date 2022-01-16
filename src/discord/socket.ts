import WebSocket from "ws";
import { saveGuild } from "../bot/database";
import { randomNum } from "../helper/common";
import Logger from "../helper/logger";
import {
  addGuild,
  commandExecuted,
  getDiscordLastS,
  getDiscordSession,
  setChannelLastAttachment,
  setDiscordLastS,
  setDiscordSession,
  setReadyData,
} from "../state/actions";
import { PRESENCE_STRINGS } from "../helper/constants";
import { editMessage, sendMessage } from "./rest";
import {
  ActivityType,
  DispatchPayload,
  GatewayEvent,
  GatewayIntents,
  Hello,
  IdentifyPayload,
  Message,
  OpCode,
  Payload,
  Status,
} from "../types/discord";

class Socket {
  private logger = new Logger("socket");

  private url: string | null = null;

  private hbInterval: NodeJS.Timeout | null = null;

  private hbAck = true;

  private client: WebSocket | null = null;

  private resumed = false;

  public connect(gateway: string) {
    this.logger.log("starting connection");

    this.resumed = false;
    this.url = gateway;
    this.logger.log(this.url);
    this.client = new WebSocket(this.url);

    this.client.on("connection", (e: any) => {
      this.onConnection(e);
    });
    this.client.on("open", () => {
      this.onOpen();
    });
    this.client.on("close", (e: any) => {
      this.onClose(e);
    });
    this.client.on("message", (e: string) => {
      this.onMessage(e);
    });
  }

  // EVENTS
  private onConnection(e: any) {
    this.logger.log("Socket connected", e);
  }

  private onClose(e: any) {
    this.logger.log(
      "Socket closed - Restarting in 2 seconds",
      e
    );

    if (this.hbInterval) {
      clearInterval(this.hbInterval);
    }

    if (e === 4005) {
      // already identified
      setDiscordSession(null);
      setDiscordLastS(null);
    }

    this.client = null;

    setTimeout(() => {
      this.connect(this.url!);
    }, 2000);
  }

  private onOpen() {
    this.hbAck = true;
    this.logger.log("Socket opened");
  }

  private onMessage(d: string): void {
    const data: Payload = JSON.parse(d);

    switch (data.op) {
      case OpCode.Dispatch:
        setDiscordLastS(data.s);
        this.onEvent(data);
        break;
      case OpCode.Heartbeat:
        this.sendHeartbeat();
        break;
      case OpCode.Reconnect:
        this.logger.log('Received "reconnect"', data.d);
        this.client?.close();
        break;
      case OpCode.InvalidSession:
        if (!data.d) {
          setDiscordSession(null);
          setDiscordLastS(null);
        }

        this.logger.log(
          'Received "invalid_session", restarting socket connection.',
          data.d
        );

        this.client?.close();
        break;
      case OpCode.Hello:
        this.onHello(data.d);
        break;
      case OpCode.HeartbeatACK:
        this.hbAck = true;
        break;
      default:
        this.logger.log("Unknown op code", data);
        break;
    }
  }

  // DISCORD EVENTS
  private onHello(data: Hello): void {
    this.logger.log("Received Hello");

    if (this.hbInterval) {
      clearInterval(this.hbInterval);
    }

    this.hbInterval = setInterval(() => {
      this.sendHeartbeat();
    }, data.heartbeat_interval);

    const sessionId = getDiscordSession();
    const lastS = getDiscordLastS();

    if (sessionId) {
      this.logger.log("Invoking resume");

      this.sendEvent({
        op: OpCode.Resume,
        d: {
          token: process.env.TOKEN!,
          session_id: sessionId,
          seq: lastS || 0,
        },
      });

      setTimeout(() => {
        if (!this.resumed) {
          this.logger.log("Did not resume.");
          this.identify();
        }
      }, 2000);
    } else {
      this.identify();
    }
  }

  private onEvent(event: DispatchPayload): void {
    switch (event.t) {
      case GatewayEvent.Ready:
        setDiscordSession(event.d.session_id);

        setReadyData(event.d);
        break;
      case GatewayEvent.GuildCreate:
        addGuild(event.d);

        saveGuild(event.d.id);
        break;
      case GatewayEvent.InteractionCreate:
        try {
          commandExecuted(event.d);
        } catch (e) {
          this.logger.error(
            "Failed to handle interaction",
            e
          );
        }
        break;
      case GatewayEvent.MessageCreate:
        if (event.d.attachments.length > 0) {
          setChannelLastAttachment(
            event.d.channel_id,
            event.d.attachments[
              event.d.attachments.length - 1
            ].url
          );
        }

        if (!event.d.guild_id) {
          this.handleDM(event.d);
        }

        break;
      case GatewayEvent.Resumed:
        this.resumed = true;
        this.logger.log("resumed", event.d);
        break;
    }
  }

  // OTHERS
  private forceReconnect(): void {
    if (this.client) {
      this.client.close();
    }
  }

  private sendHeartbeat(): void {
    if (!this.hbAck) {
      this.forceReconnect();
    } else {
      this.sendEvent({
        op: OpCode.Heartbeat,
        d: getDiscordLastS() || 0,
      });
      this.hbAck = false;
    }
  }

  public randomPresence(): void {
    const randomPresence = randomNum(
      0,
      PRESENCE_STRINGS.length
    );
    this.logger.log(
      `Updating bot presence to "${PRESENCE_STRINGS[randomPresence]}"`
    );
    this.sendEvent({
      op: OpCode.PresenceUpdate,
      d: {
        since: +new Date(),
        activities: [
          {
            name: PRESENCE_STRINGS[randomPresence],
            type: ActivityType.Custom,
            created_at: +new Date(),
          },
        ],
        status: Status.Online,
        afk: false,
      },
    });
  }

  private identify(): void {
    this.logger.log("Identifying...");
    const randomPresence = randomNum(
      0,
      PRESENCE_STRINGS.length
    );

    const payload: IdentifyPayload = {
      op: OpCode.Identify,
      d: {
        token: process.env.TOKEN!,
        properties: {
          $browser: "Kimoo-bot",
          $device: "Kimoo-bot",
          $os: process.platform,
        },
        presence: {
          since: +new Date(),
          activities: [
            {
              name: PRESENCE_STRINGS[randomPresence],
              type: ActivityType.Custom,
              created_at: +new Date(),
            },
          ],
          status: Status.Online,
          afk: false,
        },
        intents:
          GatewayIntents.GUILDS |
          GatewayIntents.GUILD_MESSAGES |
          GatewayIntents.DIRECT_MESSAGES,
      },
    };

    this.send(JSON.stringify(payload));
  }

  // private requestGuildMembers(guild: discord.guild): void {
  //   const obj: discord.request_guild_members = {
  //     guild_id: guild.id,
  //     query: "",
  //     limit: 0,
  //   };

  //   this.send(JSON.stringify({ op: opcodes.request_guild_members, d: obj }));
  // }

  private sendEvent(event: Payload): void {
    this.send(JSON.stringify(event));
  }

  private send(message: string): void {
    if (this.client) {
      this.client.send(message);
    }
  }

  private async handleDM(data: Message): Promise<void> {
    if (data.author.id === "108208089987051520") {
      const sendMessageRegex =
        /^sudo\smessage\s(?<channel>\d*)\s(?<content>(.|\n)*)/gm;
      const sendMatch = sendMessageRegex.exec(data.content);

      if (
        sendMatch &&
        sendMatch.groups?.channel &&
        sendMatch.groups?.content
      ) {
        const message = await sendMessage(
          sendMatch.groups.channel,
          `${sendMatch.groups.content}\n[stuff](https://www.livechart.me/anime/1235)`
        );
        await sendMessage(
          data.channel_id,
          message
            ? "Message sent successfully"
            : "Failed to send message"
        );
        return;
      }

      const editMessageRegex =
        /^sudo\sedit\s(?<channel>\d*)\s(?<message>\d*)\s(?<content>(.|\n)*)/gm;
      const editMatch = editMessageRegex.exec(data.content);

      if (
        editMatch &&
        editMatch.groups?.channel &&
        editMatch.groups?.message &&
        editMatch.groups?.content
      ) {
        const message = await editMessage(
          editMatch.groups.channel,
          editMatch.groups.message,
          editMatch.groups.content
        );
        await sendMessage(
          data.channel_id,
          message
            ? "Message edited successfully"
            : "Failed to edit message"
        );
      }
    }
  }
}

export default new Socket();
