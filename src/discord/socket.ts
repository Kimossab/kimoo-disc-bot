import WebSocket from 'ws';
import { saveGuild } from '../bot/bot.controller';
import { randomNum } from '../helper/common';
import Logger from '../helper/logger';
import {
  addGuild,
  commandExecuted,
  getDiscordLastS,
  getDiscordSession,
  gotNewReaction,
  setChannelLastAttachment,
  setDiscordLastS,
  setDiscordSession,
  setReadyData,
} from '../state/actions';
import {
  PRESENCE_STRINGS,
  gateway_events,
  intents,
  opcodes,
} from '../helper/constants';
import { editMessage, sendMessage } from './rest';

class Socket {
  private logger = new Logger('socket');

  private url: string | null = null;

  private hbInterval: NodeJS.Timeout | null = null;
  private hbAck: boolean = true;

  private client: WebSocket | null = null;

  private resumed: boolean = false;

  public connect(gateway: string) {
    this.logger.log('starting connection');

    this.resumed = false;
    this.url = gateway;
    this.logger.log(this.url);
    this.client = new WebSocket(this.url);

    this.client.on('connection', (e: any) => {
      this.onConnection(e);
    });
    this.client.on('open', () => {
      this.onOpen();
    });
    this.client.on('close', (e: any) => {
      this.onClose(e);
    });
    this.client.on('message', (e: string) => {
      this.onMessage(e);
    });
  }

  // EVENTS
  private onConnection(e: any) {
    this.logger.log('Socket connected', e);
  }

  private onClose(e: any) {
    this.logger.log('Socket closed - Restarting in 2 seconds', e);

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
    this.logger.log('Socket opened');
  }

  private onMessage(d: string): void {
    const data: discord.payload = JSON.parse(d);

    if (data.s) {
      setDiscordLastS(data.s);
    }

    switch (data.op) {
      case opcodes.dispatch:
        this.onEvent(data.t!, data.d);
        break;
      case opcodes.heartbeat:
        this.sendHeartbeat();
        break;
      case opcodes.reconnect:
        this.logger.log('Received "reconnect"', data.d);
        this.client!.close();
        break;
      case opcodes.invalid_session:
        if (!data.d) {
          setDiscordSession(null);
          setDiscordLastS(null);
        }

        this.logger.log(
          'Received "invalid_session", restarting socket connection.',
          data.d
        );

        this.client!.close();
        break;
      case opcodes.hello:
        this.onHello(data.d);
        break;
      case opcodes.heartbeat_ack:
        this.hbAck = true;
        break;
      default:
        this.logger.log('Unknown op code', data);
        break;
    }
  }

  // DISCORD EVENTS
  private onHello(data: discord.hello): void {
    this.logger.log('Received Hello');

    if (this.hbInterval) {
      clearInterval(this.hbInterval);
    }

    this.hbInterval = setInterval(() => {
      this.sendHeartbeat();
    }, data.heartbeat_interval);

    const sessionId = getDiscordSession();
    const lastS = getDiscordLastS();

    if (sessionId) {
      this.logger.log('Invoking resume');

      this.send(
        JSON.stringify({
          op: opcodes.resume,
          d: {
            token: process.env.TOKEN!,
            session_id: sessionId,
            seq: lastS,
          },
        })
      );

      setTimeout(() => {
        if (!this.resumed) {
          this.logger.log('Did not resume.');
          this.identify();
        }
      }, 2000);
    } else {
      this.identify();
    }
  }

  private onEvent(event: string, data: any): void {
    switch (event) {
      case gateway_events.ready:
        setDiscordSession((data as discord.ready).session_id);

        setReadyData(data as discord.ready);
        break;
      case gateway_events.guild_create:
        addGuild(data as discord.guild);

        // this.requestGuildMembers(data);

        saveGuild(data.id);
        break;
      // case gateway_events.guild_members_chunk:
      //   addGuildMembers(data as discord.guild_members_chunk);
      //   break;
      case gateway_events.interaction_create:
        commandExecuted(data as discord.interaction);
        break;
      case gateway_events.message_reaction_add:
        gotNewReaction(data as discord.message_reaction_add, false);
        break;
      case gateway_events.message_reaction_remove:
        gotNewReaction(data as discord.message_reaction_remove, true);
        break;
      case gateway_events.message_create:
        const messageData = data as discord.message;
        if (messageData.attachments.length > 0) {
          setChannelLastAttachment(
            messageData.channel_id,
            data.attachments[data.attachments.length - 1].url
          );
        }

        if (!messageData.guild_id) {
          this.handleDM(messageData);
        }

        break;
      case gateway_events.resumed:
        this.resumed = true;
        this.logger.log('resumed', event);
        break;
      /*default:
        this.logger.log("Not expected message", event);*/
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
      this.send(
        JSON.stringify({ op: opcodes.heartbeat, d: getDiscordLastS() })
      );
      this.hbAck = false;
    }
  }

  public randomPresence(): void {
    const randomPresence = randomNum(0, PRESENCE_STRINGS.length);
    this.logger.log(
      `Updating bot presence to "${PRESENCE_STRINGS[randomPresence]}"`
    );
    this.send(
      JSON.stringify({
        op: opcodes.presence_update,
        d: {
          since: +new Date(),
          activities: [
            {
              name: PRESENCE_STRINGS[randomPresence],
              type: 0,
            },
          ],
          status: 'online',
          afk: false,
        },
      })
    );
  }

  private identify(): void {
    this.logger.log('Identifying...');
    const randomPresence = randomNum(0, PRESENCE_STRINGS.length);

    const obj: discord.identify = {
      token: process.env.TOKEN!,
      properties: {
        $browser: 'Kimoo-bot',
        $device: 'Kimoo-bot',
        $os: process.platform,
      },
      presence: {
        since: +new Date(),
        activities: [
          {
            name: PRESENCE_STRINGS[randomPresence],
            type: 0,
          },
        ],
        status: 'online',
        afk: false,
      },
      intents:
        intents.guilds |
        // intents.guild_members |
        intents.guild_messages |
        intents.guild_message_reactions |
        intents.direct_messages |
        intents.direct_message_reactions,
    };

    this.send(JSON.stringify({ op: opcodes.identify, d: obj }));
  }

  // private requestGuildMembers(guild: discord.guild): void {
  //   const obj: discord.request_guild_members = {
  //     guild_id: guild.id,
  //     query: "",
  //     limit: 0,
  //   };

  //   this.send(JSON.stringify({ op: opcodes.request_guild_members, d: obj }));
  // }

  private send(message: string): void {
    if (this.client) {
      this.client.send(message);
    }
  }

  private async handleDM(data: discord.message): Promise<void> {
    if (data.author.id === '108208089987051520') {
      const sendMessageRegex = /^sudo\smessage\s(?<channel>\d*)\s(?<content>(.|\n)*)/gm;
      const sendMatch = sendMessageRegex.exec(data.content);

      if (sendMatch && sendMatch.groups?.channel && sendMatch.groups?.content) {
        const message = await sendMessage(
          sendMatch.groups.channel,
          sendMatch.groups.content +
            '\n[stuff](https://www.livechart.me/anime/1235)'
        );
        await sendMessage(
          data.channel_id,
          message ? 'Message sent successfully' : 'Failed to send message'
        );
        return;
      }

      const editMessageRegex = /^sudo\sedit\s(?<channel>\d*)\s(?<message>\d*)\s(?<content>(.|\n)*)/gm;
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
          message ? 'Message edited successfully' : 'Failed to edit message'
        );
        return;
      }
    }
  }
}

export default new Socket();
