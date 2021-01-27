import Logger from "../helper/logger";
import Parser from "rss-parser";
import {
  checkSubscription,
  getLastRequest,
  getSubscriptions,
  getUserSubscriptions,
  removeSubscription,
  setSubscription,
  updateLastRequest,
} from "../controllers/livechart.controller";
import {
  getServerAnimeChannel,
  setServerAnimeChannel,
} from "../controllers/bot.controller";
import { createInteractionResponse, sendMessage } from "../discord/rest";
import { interaction_response_type } from "../helper/constants";
import { setCommandExecutedCallback } from "../state/actions";
import messageList from "../helper/messages";
import { checkAdmin, stringReplacer } from "../helper/common";

export const name = "livechart";

const LIVE_CHART_ANIME_URL = "https://www.livechart.me/anime/";
const INTERVAL_TIME = 15;

const _logger = new Logger(name);
const parser = new Parser();

let rssInterval: NodeJS.Timeout | null = null;
let firstSetup: boolean = true;

const requestRss = () => {
  return parser.parseURL("https://www.livechart.me/feeds/episodes");
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
  _logger.log("Checking feed");

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
            const mentions = serverUsers[s].map((u) => `<@${u}>`).join(" ");

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
    _logger.error("Something went wrong", e.toJSON());
  }
};

const handleCommandSet = async (data: discord.interaction) => {
  try {
    if (!checkAdmin(data.guild_id, data.member)) {
      createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.channel_message_with_source,
        data: {
          content: messageList.common.no_permission,
        },
      });
      return;
    }

    const channel = data.data!.options![0].options![0].value;
    setServerAnimeChannel(data.guild_id, channel);

    createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.channel_message_with_source,
      data: {
        content: stringReplacer(messageList.livechart.channel_set_success, {
          channel: `<#${channel}>`,
        }),
      },
    });

    _logger.log(
      `Set anime channel to ${channel} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  } catch (e) {
    _logger.error("handleCommandSet", e);

    createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge,
    });
  }
};

const handleCommandSub = async (data: discord.interaction) => {
  try {
    const opt = data.data!.options![0].options![0];

    switch (opt.name) {
      case "add": {
        const lcId: number = opt.options![0].value;

        const hasSub = await checkSubscription(
          data.guild_id,
          data.member.user!.id,
          lcId
        );

        if (hasSub) {
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: stringReplacer(messageList.livechart.sub_exists, {
                link: `${LIVE_CHART_ANIME_URL}${lcId}`,
              }),
            },
          });
        } else {
          setSubscription(data.guild_id, data.member.user!.id, lcId);

          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: stringReplacer(messageList.livechart.sub_success, {
                link: `${LIVE_CHART_ANIME_URL}${lcId}`,
              }),
            },
          });
        }

        _logger.log(
          `Add anime subscription in ${data.guild_id} for ${lcId} by ${data.member.user?.username}#${data.member.user?.discriminator}`
        );

        break;
      }
      case "remove": {
        const lcId: number = opt.options![0].value;

        const hasSub = await checkSubscription(
          data.guild_id,
          data.member.user!.id,
          lcId
        );

        if (hasSub) {
          removeSubscription(data.guild_id, data.member.user!.id, lcId);

          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: stringReplacer(messageList.livechart.unsub_success, {
                link: `${LIVE_CHART_ANIME_URL}${lcId}`,
              }),
            },
          });
        } else {
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: stringReplacer(messageList.livechart.sub_doesnt_exists, {
                link: `${LIVE_CHART_ANIME_URL}${lcId}`,
              }),
            },
          });
        }

        _logger.log(
          `Remove anime subscription in ${data.guild_id} for ${lcId} by ${data.member.user?.username}#${data.member.user?.discriminator}`
        );

        break;
      }
      case "list": {
        const list = await getUserSubscriptions(
          data.guild_id,
          data.member.user!.id
        );

        if (list.length) {
          const embed: discord.embed = {
            title: stringReplacer(messageList.livechart.list, {
              user: `${data.member.user?.username}#${data.member.user?.discriminator}`,
            }),
            color: 6465461,
            fields: [],
          };

          for (const l of list) {
            embed.fields!.push({
              name: l.toString(),
              value: `${LIVE_CHART_ANIME_URL}${l}`,
            });
          }
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: ``,
              embeds: [embed],
            },
          });
        } else {
          createInteractionResponse(data.id, data.token, {
            type: interaction_response_type.channel_message_with_source,
            data: {
              content: messageList.livechart.list_not_found,
            },
          });
        }

        _logger.log(
          `List anime subscription in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
        );

        break;
      }
    }
  } catch (e) {
    _logger.error("handleCommandSub", e);

    createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge,
    });
  }
};

const commandExecuted = async (data: discord.interaction) => {
  if (data.data && data.data.name === "anime" && data.data.options) {
    switch (data.data.options[0].name) {
      case "set":
        handleCommandSet(data);
        break;
      case "sub":
        handleCommandSub(data);
        break;
      default:
        _logger.error(
          "UNKNOWN COMMAND",
          data.data.options[0].name,
          data.data.options[0].options,
          data.data.options[0].value
        );
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
