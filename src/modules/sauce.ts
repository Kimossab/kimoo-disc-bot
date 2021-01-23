import axios from "axios";
import {
  createInteractionResponse,
  editMessage,
  sendMessage,
} from "../discord/rest";
import { formatSecondsIntoMinutes, stringReplacer } from "../helper/common";
import Logger from "../helper/logger";
import Pagination from "../helper/pagination";
import {
  addPagination,
  getChannelLastAttchment,
  setCommandExecutedCallback,
} from "../state/actions";
import { interaction_response_type } from "../helper/constants";
import messageList from "../helper/messages";

const _logger = new Logger("sauce");
let firstSetup = true;

// SAUCE NAO
const requestSauceNao = async (
  image: string
): Promise<SauceNao.response | null> => {
  try {
    const res = await axios.get(
      `https://saucenao.com/search.php?output_type=2&api_key=${process.env.SAUCENAO_API_KEY}&testmode=1&url=${image}`
    );

    return res.data;
  } catch (e) {
    _logger.error("Requestion sauce nao", e.response);
  }

  return null;
};

const formatSauceNaoData = (data: SauceNao.result): SauceNao.data => {
  let parsed: SauceNao.data = {
    name: "",
    site: "Unknown",
    index: data.header.index_id,
    similarity: Number(data.header.similarity),
    authorData: null,
    thumbnail: data.header.thumbnail,
    url: null,
  };
  try {
    switch (data.header.index_id) {
      //dunno how this works
      // case 2: {
      //   //H-Game GG
      //   parsed.site = 'pixiv';
      //   parsed.url = [`https://www.pixiv.net/en/artworks/${data.data.pixiv_id}`];
      //   parsed.name = data.data.title;
      //   parsed.authorData = {
      //     authorName: data.data.member_name ? data.data.member_name : null,
      //     authorUrl: `https://www.pixiv.net/en/users/${data.data.member_id}`
      //   };
      // }
      case 5:
      case 6: {
        //pixiv
        parsed.site = "pixiv";
        parsed.url = [
          `https://www.pixiv.net/en/artworks/${data.data.pixiv_id}`,
        ];
        parsed.name = data.data.title;
        parsed.authorData = {
          authorName: data.data.member_name ? data.data.member_name : null,
          authorUrl: `https://www.pixiv.net/en/users/${data.data.member_id}`,
        };
        break;
      }
      case 8: {
        //Nico Nico
        parsed.site = "Nico Nico Seiga";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.title;
        parsed.authorData = {
          authorName: data.data.member_name ? data.data.member_name : null,
          authorUrl: null,
        };
        break;
      }
      case 9: {
        //danbooru / gelbooru / sankaku
        parsed.site = "danbooru / gelbooru / sankaku";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.material ? data.data.material : "";
        parsed.authorData = {
          authorName: data.data.creator ? data.data.creator.toString() : null,
          authorUrl: data.data.source ? data.data.source : null,
        };
        break;
      }
      case 11: {
        //nijie
        parsed.site = "nijie";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.title!;
        parsed.authorData = {
          authorName: data.data.member_name ? data.data.member_name : null,
          authorUrl: `https://nijie.info/members.php?id=${data.data.member_id}`,
        };
        break;
      }
      case 12: {
        //yandere
        parsed.site = "yande.re";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.material!;
        parsed.authorData = {
          authorName: data.data.creator ? data.data.creator.toString() : null,
          authorUrl: null,
        };
        break;
      }
      case 16: {
        //fakku
        parsed.site = "fakku";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.source!;
        parsed.authorData = {
          authorName: data.data.creator ? data.data.creator.toString() : null,
          authorUrl: null,
        };
        break;
      }
      case 18: {
        //nhentai
        parsed.site = "nhentai";
        const match = /\/nhentai\/(\d*)[^\/]*(\/\d*)/gm.exec(
          data.header.thumbnail
        );
        if (match) {
          const path = match[1] + match[2];
          // parsed.thumbnail = `https://i.nhentai.net/galleries/${path}.jpg`;
          parsed.url = [
            `https://nhentai.net/g/${match[1]}`,
            `https://nhentai.net/g/${path}`,
          ];
        }
        parsed.name = (data.data.eng_name || data.data.jp_name)!;
        parsed.authorData = {
          authorName: (data.data.creator as string[]).join(","),
          authorUrl: null,
        };
        break;
      }
      case 20: {
        //MediBang
        parsed.site = "MediBang";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.title;
        parsed.authorData = {
          authorName: data.data.member_name ? data.data.member_name : null,
          authorUrl: `https://medibang.com/author/${data.data.member_id}/`,
        };
        break;
      }
      case 21:
      case 22: {
        //anidb
        parsed.site = "anidb";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.source!;
        break;
      }
      case 24: {
        //imdb
        parsed.site = "imdb";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.source!;
        break;
      }
      case 27: {
        //Sankaku
        parsed.site = "Sankaku";
        parsed.name = data.data.material!;
        parsed.url = data.data.ext_urls;
        parsed.authorData = {
          authorName: data.data.creator ? data.data.creator.toString() : null,
          authorUrl: null,
        };
        break;
      }
      case 31:
      case 32: {
        //bcy
        parsed.site = "bcy";
        parsed.name = data.data.title;
        parsed.url = data.data.ext_urls;
        parsed.authorData = {
          authorName: data.data.member_name ? data.data.member_name : null,
          authorUrl: data.data.source ? data.data.source : null,
        };
        break;
      }
      case 34: {
        //deviantart
        parsed.site = "deviantart";
        parsed.url = [data.data.ext_urls[0]];
        parsed.name = data.data.title;
        parsed.authorData = {
          authorName: data.data.author_name ? data.data.author_name : null,
          authorUrl: data.data.author_url,
        };
        break;
      }
      case 35: {
        //Pawoo
        parsed.site = "Pawoo";
        parsed.url = [data.data.ext_urls[0] + data.data.pawoo_id];
        parsed.name = "";
        parsed.authorData = {
          authorName: data.data.pawoo_user_display_name
            ? data.data.pawoo_user_display_name
            : null,
          authorUrl: data.data.ext_urls[0],
        };
        break;
      }
      case 36: {
        //MangaUpdates
        parsed.site = "MangaUpdates";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.source!;
        break;
      }
      case 37: {
        //MangaDex
        parsed.site = "MangaDex";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.source!;
        break;
      }
      case 41: {
        //twitter
        parsed.site = "Twitter";
        parsed.url = data.data.ext_urls;
        parsed.name = `Tweet by ${data.data.twitter_user_handle!}`;
        parsed.authorData = {
          authorName: data.data.twitter_user_handle!,
          authorUrl: `https://twitter.com/${data.data.twitter_user_handle!}/`,
        };
        break;
      }
      default: {
        parsed.fallback = JSON.stringify(data);
      }
    }
  } catch (e) {
    _logger.error("formatSauceNaoData", e, data);
    parsed.fallback = JSON.stringify(data);
  }

  return parsed;
};

const sauceNaoEmbed = (
  item: SauceNao.data,
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: item.name,
    description: item.site,
    color: 3035554,
    fields: [],
    footer: {
      text: stringReplacer(messageList.common.page, { page, total }),
    },
  };
  if (item.thumbnail) {
    embed.image = { url: item.thumbnail.replace(/\s/g, "%20") };
  }

  embed.fields!.push({
    name: `similarity`,
    value: item.similarity.toString(),
  });

  if (item.url) {
    for (const st of item.url) {
      embed.fields!.push({
        name: `url`,
        value: st,
      });
    }
  }

  if (item.authorData) {
    embed.fields!.push({
      name: item.authorData.authorName ? item.authorData.authorName : "-",
      value: item.authorData.authorUrl ? item.authorData.authorUrl : "-",
    });
  }
  if (item.fallback) {
    embed.fields!.push({
      name: "unknown fallback",
      value: item.fallback,
    });
  }

  return embed;
};

const sauceNaoUpdatePage = async (
  channel: string,
  message: string,
  data: SauceNao.data,
  page: number,
  total: number
): Promise<void> => {
  await editMessage(channel, message, "", sauceNaoEmbed(data, page, total));
};

const handleSauceNao = async (
  data: discord.interaction,
  image: string
): Promise<void> => {
  const saucenao = await requestSauceNao(image);

  if (!saucenao) {
    await sendMessage(data.channel_id, messageList.sauce.not_found);
    return;
  }

  if (saucenao?.header.status > 0) {
    _logger.error("SauceNao - Ext error", saucenao);
    await sendMessage(data.channel_id, messageList.sauce.not_found);
    return;
  }

  if (saucenao?.header.status < 0) {
    _logger.error("SauceNao - Int error", saucenao);
    await sendMessage(data.channel_id, messageList.sauce.not_found);
    return;
  }

  let resData: SauceNao.data[] = [];
  for (const res of saucenao.results) {
    resData.push(formatSauceNaoData(res));
  }

  // sort and filter
  resData = resData.sort((a, b) => b.similarity - a.similarity);
  resData = resData.filter((a) => a.similarity > 75);

  if (resData.length === 0) {
    await sendMessage(data.channel_id, messageList.sauce.not_found);
    return;
  }

  const message = await sendMessage(
    data.channel_id,
    "",
    sauceNaoEmbed(resData[0], 1, resData.length)
  );
  if (message) {
    const pagination = new Pagination<SauceNao.data>(
      data.channel_id,
      message.id,
      resData,
      sauceNaoUpdatePage
    );

    addPagination(pagination);
  }
};

//TRACE MOE
const traceMoeEmbed = (
  item: TraceMoe.doc,
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: `${item.title_english} (${item.title})`,
    description: `Episode #${item.episode} @${formatSecondsIntoMinutes(
      item.at
    )}`,
    color: 3035554,
    url: `https://myanimelist.net/anime/${item.mal_id}`,
    fields: [
      {
        name: messageList.sauce.similarity,
        value: `${Math.round(item.similarity * 100)}%`,
      },
      {
        name: messageList.sauce.season,
        value: item.season,
      },
    ],
    image: {
      url: `https://trace.moe/thumbnail.php?anilist_id=${
        item.anilist_id
      }&file=${encodeURIComponent(item.filename)}&t=${item.at}&token=${
        item.tokenthumb
      }`,
    },
    footer: {
      text: stringReplacer(messageList.common.page, { page, total }),
    },
  };

  if (item.synonyms.length > 0) {
    embed.fields?.push({
      name: messageList.sauce.other_names,
      value: item.synonyms.join(" | "),
    });
  }

  embed.fields?.push({
    name: `⠀`,
    value: `[Video](https://media.trace.moe/video/${
      item.anilist_id
    }/${encodeURIComponent(item.filename)}?t=${item.at}&token=${
      item.tokenthumb
    })`,
  });

  _logger.log("embed", embed);
  return embed;
};

const requestTraceMoe = async (
  image: string
): Promise<TraceMoe.response | null> => {
  try {
    const res = await axios.get(`https://trace.moe/api/search?url=${image}`);

    return res.data;
  } catch (e) {
    _logger.error("Requestion sauce nao", e.response);
  }

  return null;
};

const traceMoeUpdatePage = async (
  channel: string,
  message: string,
  data: TraceMoe.doc,
  page: number,
  total: number
): Promise<void> => {
  await editMessage(channel, message, "", traceMoeEmbed(data, page, total));
};

const handleTraceMoe = async (
  data: discord.interaction,
  image: string
): Promise<void> => {
  //https://soruly.github.io/trace.moe/#/
  const traceMoe = await requestTraceMoe(image);

  if (!traceMoe || traceMoe.docs.length === 0) {
    await sendMessage(data.channel_id, messageList.sauce.not_found);
    return;
  }

  const message = await sendMessage(
    data.channel_id,
    "",
    traceMoeEmbed(traceMoe.docs[0], 1, traceMoe.docs.length)
  );

  if (message) {
    const pagination = new Pagination<TraceMoe.doc>(
      data.channel_id,
      message.id,
      traceMoe.docs,
      traceMoeUpdatePage
    );

    addPagination(pagination);
  }
};

const commandExecuted = async (data: discord.interaction) => {
  if (data.data && data.data.name === "sauce") {
    const type = data.data.options?.find((o) => o.name === "type");
    const image = data.data.options?.find((o) => o.name === "image");
    const lastAttachment = getChannelLastAttchment(data.channel_id);

    if (!image && !lastAttachment) {
      createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.channel_message_with_source,
        data: {
          content: messageList.sauce.image_not_found,
        },
      });
      return;
    }

    createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge,
    });

    let url = image ? image.value : lastAttachment;

    if (!type || type.value === "art") {
      handleSauceNao(data, url);
    } else {
      //anime
      handleTraceMoe(data, url);
    }
  }
};

export const SetUp = () => {
  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
