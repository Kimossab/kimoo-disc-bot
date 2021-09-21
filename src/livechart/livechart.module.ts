import Logger from '../helper/logger';
import Parser from 'rss-parser';
import {
  checkSubscription,
  getAnimeInfo,
  getLastRequest,
  getSubscriptions,
  getUserSubscriptions,
  removeSubscription,
  setSubscription,
  updateLastRequest,
} from './livechart.controller';
import {
  getServerAnimeChannel,
  setServerAnimeChannel,
} from '../bot/bot.controller';
import {
  createInteractionResponse,
  editOriginalInteractionResponse,
  sendMessage,
} from '../discord/rest';
import { interaction_response_type } from '../helper/constants';
import {
  addPagination,
  getApplication,
  setCommandExecutedCallback,
} from '../state/actions';
import messageList from '../helper/messages';
import { checkAdmin, chunkArray, stringReplacer } from '../helper/common';
import { getOption, getOptionValue } from '../helper/modules.helper';
import { ILivechartAnimeInfo } from './anime-info.model';
import Pagination from '../helper/pagination';

export const name = 'livechart';

const INTERVAL_TIME = 15;

const _logger = new Logger(name);
const parser = new Parser();

let rssInterval: NodeJS.Timeout | null = null;
let firstSetup: boolean = true;

const requestRss = () => {
  return parser.parseURL('https://www.livechart.me/feeds/episodes');
};

const itemEmbed = (item: Parser.Item): discord.embed => {
  return {
    title: item.title,
    description: messageList.livechart.new_episode,
    url: item.link,
    color: 6465461,
    image: {
      url: item.enclosure!.url,
    },
    fields: [
      {
        name: messageList.livechart.date,
        value: item.pubDate!,
      },
    ],
  };
};

const checkRss = async (): Promise<void> => {
  _logger.log('Checking feed');

  const animeIdRegex = /\/(?<id>\d*)$/;

  try {
    const data = await requestRss();
    const lastRequest = await getLastRequest();

    for (const item of data.items) {
      const iDate = +new Date(item.pubDate!);

      if (iDate > lastRequest) {
        const serverUsers: string_object<string[]> = {};
        _logger.log(`New episode just went live: ${item.title}`);

        const reg = animeIdRegex.exec(item.link!);
        if (reg?.groups && reg?.groups.id) {
          const allSubs = await getSubscriptions(Number(reg.groups.id));

          for (const sub of allSubs) {
            if (serverUsers[sub.server]) {
              serverUsers[sub.server].push(sub.user);
            } else {
              serverUsers[sub.server] = [sub.user];
            }
          }
        }

        for (const s in serverUsers) {
          if (Object.prototype.hasOwnProperty.call(serverUsers, s)) {
            const embed = itemEmbed(item);
            const mentions = serverUsers[s].map((u) => `<@${u}>`).join(' ');

            const channel = await getServerAnimeChannel(s);

            if (channel) {
              sendMessage(channel, mentions, embed);
            }
          }
        }
      }
    }

    await updateLastRequest(+new Date());
  } catch (e) {
    _logger.error('Something went wrong', JSON.stringify(e));
  }
};

const animeInfoEmbed = (data: ILivechartAnimeInfo): discord.embed => {
  const embed: discord.embed = {
    title: data.title || data.id.toString(),
    url: data.url,
    color: 3905532,
    provider: {
      name: 'LiveChart.me',
      url: 'https://www.livechart.me',
    },
  };

  if (data.description) {
    embed.description = data.description;
  }

  if (data.image) {
    embed.image = {
      url: data.image,
    };
  }

  return embed;
};

const updateListPage = async (
  data: number[],
  page: number,
  total: number,
  token: string,
  userInfo: Nullable<discord.guild_member>
) => {
  const app = getApplication();
  if (app) {
    await editOriginalInteractionResponse(app.id, token, {
      content: '',
      embeds: [await itemListEmbed(data, page, total, userInfo)],
    });
  }
};

const itemListEmbed = async (
  items: number[],
  page: number,
  total: number,
  member: Nullable<discord.guild_member>
): Promise<discord.embed> => {
  const embed: discord.embed = {
    title: stringReplacer(messageList.livechart.list, {
      user: `${member?.user?.username}#${member?.user?.discriminator}`,
    }),
    color: 6465461,
    fields: [],
    footer: {
      text: stringReplacer(messageList.common.page, { page, total }),
    },
  };

  for (const l of items) {
    const animeInfo = await getAnimeInfo(l);
    if (animeInfo) {
      embed.fields!.push({
        name: animeInfo.title || animeInfo.id.toString(),
        value: animeInfo.url,
      });
    }
  }

  return embed;
};

const handleCommandSet = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    try {
      if (!checkAdmin(data.guild_id, data.member)) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.common.no_permission,
        });
        return;
      }

      const channel = getOptionValue<string>(option.options, 'channel');

      setServerAnimeChannel(data.guild_id, channel!);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.livechart.channel_set_success, {
          channel: `<#${channel}>`,
        }),
      });

      _logger.log(
        `Set anime channel to ${channel} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    } catch (e) {
      _logger.error('handleCommandSet', e);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.internal_error,
      });
    }
  }
};

const handleCommandSub = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    try {
      const add = getOption(option.options, 'add');
      const remove = getOption(option.options, 'remove');
      const list = getOption(option.options, 'list');

      if (add) {
        const lcId = getOptionValue<number>(add.options, 'livechart_id');

        if (!lcId) {
          throw 'Missing id';
        }

        const animeInfo = await getAnimeInfo(lcId);

        if (!animeInfo) {
          await editOriginalInteractionResponse(app.id, data.token, {
            content: stringReplacer(messageList.livechart.anime_not_found, {
              id: `${lcId}`,
            }),
          });
          return;
        }

        const hasSub = await checkSubscription(
          data.guild_id,
          data.member.user!.id,
          lcId!
        );

        if (hasSub) {
          const embed = animeInfoEmbed(animeInfo);
          await editOriginalInteractionResponse(app.id, data.token, {
            content: stringReplacer(messageList.livechart.sub_exists, {
              link: `[${animeInfo.title || animeInfo.url}](${animeInfo.url})`,
            }),
            embeds: [embed],
          });
        } else {
          await setSubscription(data.guild_id, data.member.user!.id, lcId!);

          const embed = animeInfoEmbed(animeInfo);

          await editOriginalInteractionResponse(app.id, data.token, {
            content: stringReplacer(messageList.livechart.sub_success, {
              link: `[${animeInfo.title || animeInfo.url}](${animeInfo.url})`,
            }),
            embeds: [embed],
          });
        }

        _logger.log(
          `Add anime subscription in ${data.guild_id} for ${lcId} by ${data.member.user?.username}#${data.member.user?.discriminator}`
        );
      } else if (remove) {
        const lcId = getOptionValue<number>(remove.options, 'livechart_id');

        if (!lcId) {
          throw 'Missing id';
        }

        const animeInfo = await getAnimeInfo(lcId);

        if (!animeInfo) {
          await editOriginalInteractionResponse(app.id, data.token, {
            content: stringReplacer(messageList.livechart.anime_not_found, {
              id: `${lcId}`,
            }),
          });
          return;
        }

        const hasSub = await checkSubscription(
          data.guild_id,
          data.member.user!.id,
          lcId!
        );

        if (hasSub) {
          await removeSubscription(data.guild_id, data.member.user!.id, lcId!);

          await editOriginalInteractionResponse(app.id, data.token, {
            content: stringReplacer(messageList.livechart.unsub_success, {
              link: `[${animeInfo.title || animeInfo.url}](${animeInfo.url})`,
            }),
          });
        } else {
          await editOriginalInteractionResponse(app.id, data.token, {
            content: stringReplacer(messageList.livechart.sub_doesnt_exists, {
              link: `[${animeInfo.title || animeInfo.url}](${animeInfo.url})`,
            }),
          });
        }

        _logger.log(
          `Remove anime subscription in ${data.guild_id} for ${lcId} by ${data.member.user?.username}#${data.member.user?.discriminator}`
        );
      } else if (list) {
        const list = await getUserSubscriptions(
          data.guild_id,
          data.member.user!.id
        );

        if (list.length) {
          const chunks = chunkArray<number>(list, 10);

          const embed = await itemListEmbed(
            chunks[0],
            1,
            chunks.length,
            data.member
          );
          const message = await editOriginalInteractionResponse(
            app.id,
            data.token,
            {
              content: '',
              embeds: [embed],
            }
          );
          if (message && chunks.length > 1) {
            const pagination = new Pagination<number[]>(
              data.channel_id,
              message.id,
              chunks,
              updateListPage,
              data.token,
              data.member
            );

            addPagination(pagination);
          }
        } else {
          await editOriginalInteractionResponse(app.id, data.token, {
            content: messageList.livechart.list_not_found,
          });
        }

        _logger.log(
          `List anime subscription in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
        );
      }
    } catch (e) {
      _logger.error('handleCommandSub', e);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.internal_error,
      });
    }
  }
};

const commandExecuted = async (data: discord.interaction): Promise<void> => {
  if (data.data && data.data.name === 'anime' && data.data.options) {
    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge_with_source,
    });

    const set = getOption(data.data.options, 'set');
    const sub = getOption(data.data.options, 'sub');

    if (set) {
      return await handleCommandSet(data, set);
    }

    if (sub) {
      return await handleCommandSub(data, sub);
    }

    _logger.error(
      'UNKNOWN COMMAND',
      data.data.options[0].name,
      data.data.options[0].options,
      data.data.options[0].value
    );
    const app = getApplication();
    if (app) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.internal_error,
      });
    }
  }
};

const startFeed = () => {
  if (rssInterval) {
    clearInterval(rssInterval);
  }

  checkRss();

  rssInterval = setInterval(() => {
    checkRss();
  }, INTERVAL_TIME * 60 * 1000);
};

export const setUp = () => {
  startFeed();

  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
