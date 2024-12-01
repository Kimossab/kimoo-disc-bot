import {
  ActivityType,
  GatewayDispatchEvents,
  GatewayDispatchPayload,
  GatewayHelloData,
  GatewayIdentify,
  GatewayIntentBits,
  GatewayMessageCreateDispatchData,
  GatewayOpcodes,
  GatewayReceivePayload,
  GatewaySendPayload,
  GatewayUpdatePresence,
  PresenceUpdateStatus,
} from "discord-api-types/v10";
import { PRESENCE_STRINGS } from "@/helper/constants";
import {
  addGuild,
  commandExecuted,
  getDiscordLastS,
  getDiscordSession,
  getResumeGateway,
  setDiscordLastS,
  setDiscordSession,
  setReadyData,
} from "@/state/store";
import { randomNum } from "@/helper/common";
import { saveGuild } from "@/database";
import Logger from "@/helper/logger";

import WebSocket from "ws";

export class Socket {
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

    this.client.on(
      "connection",
      (e: unknown) => {
        this.onConnection(e);
      },
    );
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

  public disconnect() {
    this.client?.close(1001);
    this.hbInterval && clearTimeout(this.hbInterval);
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
    const data: GatewayReceivePayload = JSON.parse(d);

    switch (data.op) {
      case GatewayOpcodes.Dispatch:
        setDiscordLastS(data.s);
        this.onEvent(data);
        break;
      case GatewayOpcodes.Heartbeat:
        this.sendHeartbeat();
        break;
      case GatewayOpcodes.Reconnect:
        this.logger.info("Received \"reconnect\"", data.d);
        this.client?.close();
        break;
      case GatewayOpcodes.InvalidSession:
        if (!data.d) {
          setDiscordSession(null);
          setDiscordLastS(null);
        }

        this.logger.info(
          "Received \"invalid_session\", restarting socket connection.",
          data.d,
        );

        this.client?.close();
        break;
      case GatewayOpcodes.Hello:
        this.onHello(data.d);
        break;
      case GatewayOpcodes.HeartbeatAck:
        this.hbAck = true;
        break;
      default:
        this.logger.info("Unknown op code", data);
        break;
    }
  }

  // DISCORD EVENTS
  private onHello(data: GatewayHelloData): void {
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
        op: GatewayOpcodes.Resume,
        d: {
          token: process.env.TOKEN,
          session_id: sessionId,
          seq: lastS || 0,
        },
      });
    }
    else {
      this.identify();
    }
  }

  private async onEvent(event: GatewayDispatchPayload): Promise<void> {
    switch (event.t) {
      case GatewayDispatchEvents.Ready:
        setDiscordSession(event.d.session_id);

        setReadyData(event.d);
        break;
      case GatewayDispatchEvents.GuildCreate:
        addGuild(event.d);

        await saveGuild(event.d.id);
        break;
      case GatewayDispatchEvents.InteractionCreate:
        try {
          commandExecuted(event.d);
        }
        catch (e) {
          this.logger.error("Failed to handle interaction", e);
        }
        break;
      case GatewayDispatchEvents.MessageCreate:
        if (!event.d.guild_id) {
          this.handleDM(event.d);
        }

        break;
      case GatewayDispatchEvents.Resumed:
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
    }
    else {
      this.sendEvent({
        op: GatewayOpcodes.Heartbeat,
        d: getDiscordLastS() || 0,
      });
      this.hbAck = false;
    }
  }

  public randomPresence(): void {
    const randomPresence = randomNum(0, PRESENCE_STRINGS.length);
    this.logger.info(`Updating bot presence to "${PRESENCE_STRINGS[randomPresence]}"`);
    const presenceUpdate: GatewayUpdatePresence = {
      op: GatewayOpcodes.PresenceUpdate,
      d: {
        since: null,
        activities: [
          {
            name: "I am present",
            state: PRESENCE_STRINGS[randomPresence],
            type: ActivityType.Custom,
          },
        ],
        status: PresenceUpdateStatus.Online,
        afk: false,
      },
    };

    this.sendEvent(presenceUpdate);
  }

  private identify(): void {
    this.logger.info("Identifying...");

    const payload: GatewayIdentify = {
      op: GatewayOpcodes.Identify,
      d: {
        token: process.env.TOKEN,
        properties: {
          browser: "Kimoo-bot",
          device: "Kimoo-bot",
          os: process.platform,
        },
        intents:
          GatewayIntentBits.Guilds
          | GatewayIntentBits.GuildMessages
          | GatewayIntentBits.DirectMessages,
      },
    };

    this.sendEvent(payload);
  }

  private sendEvent(event: GatewaySendPayload): void {
    this.send(JSON.stringify(event));
  }

  private send(message: string): void {
    if (this.client) {
      this.client.send(message);
    }
  }

  private async handleDM(_data: GatewayMessageCreateDispatchData): Promise<void> {
    this.logger.info("New DM", _data);
  }
}
