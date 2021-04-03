import net from 'net';
import Logger from '../helper/logger';
import { operators, VNDB } from './types';

const VNDB_API = 'api.vndb.org';
const VNDB_PORT = 19534;
const COMMAND_TIMEOUT = 15 * 1000; // 15 seconds
const RESPONSE_BYTE_BUFFER = 2500 * 1024; // 2500 KiB
const MESSAGE_TERMINATION = Buffer.from([0x04]);

export type vndb_get_vn = VNDB.return_data.get_vn &
  VNDB.return_data.get_vn_basic &
  VNDB.return_data.get_vn_details &
  VNDB.return_data.get_vn_anime &
  VNDB.return_data.get_vn_stats &
  VNDB.return_data.get_vn_relations;

export class VNDBApi {
  private client: net.Socket;
  private logger = new Logger('VNDBTcp');
  private queue: VNDB.queue[] = [];
  private waitingReply = false;
  private commandTimeout: NodeJS.Timeout | null = null;

  private responseBuffer: string | null = null;

  constructor() {
    this.client = net.createConnection(
      {
        host: VNDB_API,
        port: VNDB_PORT,
        onread: {
          buffer: Buffer.alloc(RESPONSE_BYTE_BUFFER),
          callback: (nread, buf: Buffer) => {
            const end = buf.includes(0x04);

            const str = buf.toString('utf8', 0, end ? nread - 1 : nread);

            if (this.responseBuffer === null) {
              this.responseBuffer = str;
            } else {
              this.responseBuffer += str;
            }

            if (end) {
              this.onData(this.responseBuffer);
              this.responseBuffer = null;
            }

            return true;
          },
        },
      },
      () => this.onConnect()
    );

    this.client.on('end', () => this.OnEnd());
  }

  // EVENTS
  private onConnect(): void {
    this.logger.log(`[Connected]`);
    this.login();
  }

  private onData(data: string): void {
    if (data.startsWith('error')) {
      const sData = data.substring(6);
      this.queueResolve(null);
      this.logger.error('[RECEIVED ERROR]', JSON.parse(sData));
    } else {
      this.queueResolve(data);
    }
  }

  private OnEnd(): void {
    this.logger.log(`[Disconnected]`);
  }

  // COMMANDS
  private login(): void {
    this.addQueue(
      this.formatCommand({
        command: 'login',
        data: {
          protocol: 1,
          client: 'kimoo-disc-bot',
          clientver: '0.0.1',
        },
      }),
      (data): void => {
        this.logger.log(`[LOGIN RESPONSE] ${data}`);
      }
    );
  }

  public search(name: string): Promise<vndb_get_vn[] | null> {
    const searchCommand: VNDB.commands.get_vn = {
      command: 'get',
      type: 'vn',
      filters: [{ field: 'title', operator: operators.like, value: name }],
      flags: [
        VNDB.flags.basic,
        VNDB.flags.details,
        VNDB.flags.anime,
        VNDB.flags.stats,
        VNDB.flags.relations,
      ],
      options: {
        sort: 'rating',
        results: 10,
        reverse: true,
      },
    };
    return new Promise((resolve) => {
      this.addQueue(this.formatCommand(searchCommand), (data) => {
        if (data) {
          if (data.startsWith('results')) {
            data = data.slice(8);
          }
          const parsed: VNDB.return_data.data<vndb_get_vn> = JSON.parse(data);

          this.logger.log('[SEARCH RESULT] OK');
          resolve(parsed.items);
        } else {
          this.logger.log('[SEARCH RESULT] NO DATA');
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

  private addQueue(command: Buffer, callback: VNDB.queue_callback): void {
    this.queue.push({
      command,
      callback,
    });

    this.logger.log(`[ADD QUEUE] ${command.toString()}`);

    this.checkQueue();
  }

  private checkQueue(): void {
    if (!this.waitingReply && this.queue.length > 0) {
      this.logger.log(`[SENDING COMMAND] ${this.queue[0].command.toString()}`);
      this.client.write(this.queue[0].command);
      this.waitingReply = true;

      this.commandTimeout = setTimeout(() => {
        this.logger.error(`[COMMAND TIMEOUT]`, this.queue[0]);

        this.queueResolve(null);

        this.checkQueue();
      }, COMMAND_TIMEOUT);
    }
  }

  // HELPERS
  private formatFilters(data: VNDB.commands.get_vn_filters[]): string {
    let filters = '';

    for (let i = 0; i < data.length; i++) {
      if (i !== 0) {
        filters += `${data[i].join ? data[i].join : 'AND'} `;
      }

      let value = data[i].value;

      if (typeof data[i].value === 'string') {
        value = `"${value}"`;
      }

      filters += `${data[i].field} ${data[i].operator} ${value}`;
    }

    return `(${filters})`;
  }

  private formatLogin(data: VNDB.commands.login): string {
    return JSON.stringify(data.data);
  }

  private formatGetVN(data: VNDB.commands.get_vn): string {
    const flags = data.flags.join(',');
    const filters = this.formatFilters(data.filters);
    const options = data.options ? JSON.stringify(data.options) : '';

    return `${flags} ${filters} ${options}`;
  }

  private formatCommand(data: VNDB.commands.command): Buffer {
    let commandString = `${data.command} `;

    if (data.command === 'login') {
      commandString += this.formatLogin(data);
    } else if (data.command === 'get') {
      commandString += `${data.type} `;

      if (data.type === 'vn') {
        commandString += this.formatGetVN(data);
      }
    }

    const messBuff = Buffer.from(commandString, 'utf8');
    return Buffer.concat(
      [messBuff, MESSAGE_TERMINATION],
      messBuff.length + MESSAGE_TERMINATION.length
    );
  }
}
