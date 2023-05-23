import Logger from "@/helper/logger";

import * as Commands from "./types/commands";
import * as ReturnData from "./types/returnData";
import { flags, operators, queue, queue_callback } from "./types/vndb";
import net from "net";

const VNDB_API = "api.vndb.org";
const VNDB_PORT = 19534;
const COMMAND_TIMEOUT = 15 * 1000; // 15 seconds
// const RESPONSE_BYTE_BUFFER = 2500 * 1024; // 2500 KiB
const MESSAGE_TERMINATION = Buffer.from([0x04]);

export type vndb_get_vn = ReturnData.get_vn &
  ReturnData.get_vn_basic &
  ReturnData.get_vn_details &
  ReturnData.get_vn_anime &
  ReturnData.get_vn_stats &
  ReturnData.get_vn_relations;

export class VNDBApi {
  private client: net.Socket;

  private logger = new Logger("VNDBApi");

  private queue: queue[] = [];

  private waitingReply = false;

  private commandTimeout: NodeJS.Timeout | null = null;

  private responseBuffer: string | null = null;

  constructor() {
    this.client = net.createConnection(
      {
        host: VNDB_API,
        port: VNDB_PORT,
      },
      () => this.onConnect()
    );

    this.client.on("end", () => this.OnEnd());
    this.client.on("data", (data) => this.OnData(data));
  }

  // EVENTS
  private onConnect(): void {
    this.logger.info("[Connected]");
    this.login();
  }

  private OnData(data: Buffer): void {
    const end = data.includes(0x04);

    const str = data.toString("utf8");

    if (this.responseBuffer === null) {
      this.responseBuffer = str;
    } else {
      this.responseBuffer += str;
    }

    if (end) {
      this.onDataStr(this.responseBuffer);
      this.responseBuffer = null;
    }
  }

  private onDataStr(data: string): void {
    if (data.startsWith("error")) {
      const sData = data.substring(6);
      this.queueResolve(null);
      this.logger.error("[RECEIVED ERROR]", JSON.parse(sData));
    } else {
      this.queueResolve(data);
    }
  }

  private OnEnd(): void {
    this.logger.info("[Disconnected]");
  }

  // COMMANDS
  private login(): void {
    this.addQueue(
      this.formatCommand({
        command: "login",
        data: {
          protocol: 1,
          client: "kimoo-disc-bot",
          clientver: "2.4.2",
        },
      }),
      (data): void => {
        this.logger.info(`[LOGIN RESPONSE] ${data}`);
      }
    );
  }

  public search(name: string): Promise<vndb_get_vn[] | null> {
    const searchCommand: Commands.get_vn = {
      command: "get",
      type: "vn",
      filters: [
        {
          field: "title",
          operator: operators.like,
          value: name,
        },
      ],
      flags: [
        flags.basic,
        flags.details,
        flags.anime,
        flags.stats,
        flags.relations,
      ],
      options: {
        sort: "rating",
        results: 10,
        reverse: true,
      },
    };
    return new Promise((resolve) => {
      this.addQueue(this.formatCommand(searchCommand), (data) => {
        if (data) {
          if (data.startsWith("results")) {
            data = data.slice(8, data.length - 1);
          }
          const parsed: ReturnData.data<vndb_get_vn> = JSON.parse(data);

          this.logger.info("[SEARCH RESULT] OK");
          resolve(parsed.items);
        } else {
          this.logger.info("[SEARCH RESULT] NO DATA");
          resolve(null);
        }
      });
    });
  }

  // QUEUE
  private queueResolve(data: string | null): void {
    this.waitingReply = false;

    if (this.commandTimeout) {
      clearTimeout(this.commandTimeout);
      this.commandTimeout = null;
    }

    if (this.queue.length > 0) {
      this.queue[0].callback(data);

      this.queue.splice(0, 1);
    }
  }

  private addQueue(command: Buffer, callback: queue_callback): void {
    this.queue.push({
      command,
      callback,
    });

    this.logger.info(`[ADD QUEUE] ${command.toString()}`);

    this.checkQueue();
  }

  private checkQueue(): void {
    if (!this.waitingReply && this.queue.length > 0) {
      this.logger.info(`[SENDING COMMAND] ${this.queue[0].command.toString()}`);
      this.client.write(this.queue[0].command);
      this.waitingReply = true;

      this.commandTimeout = setTimeout(() => {
        this.logger.error("[COMMAND TIMEOUT]", this.queue[0]);

        this.queueResolve(null);

        this.checkQueue();
      }, COMMAND_TIMEOUT);
    }
  }

  // HELPERS
  private formatFilters(data: Commands.get_vn_filters[]): string {
    let filters = "";

    for (let i = 0; i < data.length; i++) {
      if (i !== 0) {
        filters += `${data[i].join ? data[i].join : "AND"} `;
      }

      let { value } = data[i];

      if (typeof data[i].value === "string") {
        value = `"${value}"`;
      }

      filters += `${data[i].field} ${data[i].operator} ${value}`;
    }

    return `(${filters})`;
  }

  private formatLogin(data: Commands.login): string {
    return JSON.stringify(data.data);
  }

  private formatGetVN(data: Commands.get_vn): string {
    const flags = data.flags.join(",");
    const filters = this.formatFilters(data.filters);
    const options = data.options ? JSON.stringify(data.options) : "";

    return `${flags} ${filters} ${options}`;
  }

  private formatCommand(data: Commands.command): Buffer {
    let commandString = `${data.command} `;

    if (data.command === "login") {
      commandString += this.formatLogin(data);
    } else if (data.command === "get") {
      commandString += `${data.type} `;

      if (data.type === "vn") {
        commandString += this.formatGetVN(data);
      }
    }

    const messBuff = Buffer.from(commandString, "utf8");
    return Buffer.concat(
      [messBuff, MESSAGE_TERMINATION],
      messBuff.length + MESSAGE_TERMINATION.length
    );
  }
}
