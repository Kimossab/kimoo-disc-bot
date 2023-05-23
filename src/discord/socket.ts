import { saveGuild } from "@/bot/database";
import { randomNum } from "@/helper/common";
import { PRESENCE_STRINGS } from "@/helper/constants";
import Logger from "@/helper/logger";
import {
  addGuild,
  commandExecuted,
  getDiscordLastS,
  getDiscordSession,
  getResumeGateway,
  setChannelLastAttachment,
  setDiscordLastS,
  setDiscordSession,
  setReadyData,
} from "@/state/store";
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
} from "@/types/discord";

import WebSocket from "ws";

class Socket {
  private logger = new Logger("socket");
  private hbInterval: NodeJS.Timeout | null = null;

  private hbAck = true;

  private client: WebSocket | null = null;

  private resumed = false;

  public connect(gateway: string) {
    this.logger.info("starting connection");

    this.resumed = false;
    this.logger.info(`Gateway: ${gateway}`);
    this.client = new WebSocket(gateway);

    this.client.on("connection", (e: unknown) => {
      this.onConnection(e);
    });
    this.client.on("open", () => {
      this.onOpen();
    });
    this.client.on("close", (e: unknown) => {
      this.onClose(e);
    });
    this.client.on("message", (e: string) => {
      this.onMessage(e);
    });
  }

  // EVENTS
  private onConnection(e: unknown) {
    this.logger.info("Socket connected", e);
  }

  private onClose(e: unknown) {
    this.logger.info("Socket closed - Restarting in 2 seconds", e);

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
      this.connect(getResumeGateway());
    }, 2000);
  }

  private onOpen() {
    this.hbAck = true;
    this.logger.info("Socket opened");
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
        this.logger.info('Received "reconnect"', data.d);
        this.client?.close();
        break;
      case OpCode.InvalidSession:
        if (!data.d) {
          setDiscordSession(null);
          setDiscordLastS(null);
        }

        this.logger.info(
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
        this.logger.info("Unknown op code", data);
        break;
    }
  }

  // DISCORD EVENTS
  private onHello(data: Hello): void {
    this.logger.info("Received Hello");

    if (this.hbInterval) {
      clearInterval(this.hbInterval);
    }

    this.hbInterval = setInterval(() => {
      this.sendHeartbeat();
      this.logger.info("hb", { heartbeat_interval: data.heartbeat_interval });
    }, data.heartbeat_interval);

    const sessionId = getDiscordSession();
    const lastS = getDiscordLastS();

    if (sessionId) {
      this.logger.info("Invoking resume", {
        token: process.env.TOKEN,
        session_id: sessionId,
        seq: lastS || 0,
      });

      this.sendEvent({
        op: OpCode.Resume,
        d: {
          token: process.env.TOKEN,
          session_id: sessionId,
          seq: lastS || 0,
        },
      });
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
          this.logger.error("Failed to handle interaction", e);
        }
        break;
      case GatewayEvent.MessageCreate:
        if (event.d.attachments.length > 0) {
          setChannelLastAttachment({
            channel: event.d.channel_id,
            attachment: event.d.attachments[event.d.attachments.length - 1].url,
          });
        }

        if (!event.d.guild_id) {
          this.handleDM(event.d);
        }

        break;
      case GatewayEvent.Resumed:
        this.resumed = true;
        this.logger.info("resumed", event.d);
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
    const randomPresence = randomNum(0, PRESENCE_STRINGS.length);
    this.logger.info(
      `Updating bot presence to "${PRESENCE_STRINGS[randomPresence]}"`
    );
    this.sendEvent({
      op: OpCode.PresenceUpdate,
      d: {
        since: null,
        activities: [
          {
            name: PRESENCE_STRINGS[randomPresence],
            type: ActivityType.Game,
          },
        ],
        status: Status.Online,
        afk: false,
      },
    });
  }

  private identify(): void {
    this.logger.info("Identifying...");

    const payload: IdentifyPayload = {
      op: OpCode.Identify,
      d: {
        token: process.env.TOKEN,
        properties: {
          browser: "Kimoo-bot",
          device: "Kimoo-bot",
          os: process.platform,
        },
        intents:
          GatewayIntents.GUILDS |
          GatewayIntents.GUILD_MESSAGES |
          GatewayIntents.DIRECT_MESSAGES,
      },
    };

    this.sendEvent(payload);
  }

  private sendEvent(event: Payload): void {
    this.send(JSON.stringify(event));
  }

  private send(message: string): void {
    if (this.client) {
      this.client.send(message);
    }
  }

  private async handleDM(_data: Message): Promise<void> {
    this.logger.info("New DM", _data);
  }
}

export default new Socket();
