import fs from 'fs';
import https from 'https';
import axios from 'axios';
import FormData from 'form-data';
import { downloadFile, formatSecondsIntoMinutes, stringReplacer } from '../helper/common';
import Pagination from '../helper/pagination';
import messageList from '../helper/messages';
import { editMessage, editOriginalInteractionResponse } from '../discord/rest';
import Logger from '../helper/logger';
import { addPagination, getApplication } from '../state/actions';

const _logger = new Logger('sauce-trace-moe');

const traceMoeEmbed = (
  item: TraceMoe.resultData,
  page: number,
  total: number
): discord.embed => {
  let title: string[] = [];

  if (item.anilist.title?.english) {
    title.push(item.anilist.title.english);
  }

  if (item.anilist.title?.romaji) {
    title.push(item.anilist.title.romaji);
  }

  if (item.anilist.title?.native) {
    title.push(item.anilist.title.native);
  }

  title = title.filter((elem, index, self) => {
    return index === self.indexOf(elem);
  });

  const description: string[] = [];

  if (item.episode) {
    description.push(`Episode #${item.episode}`);
  }
  description.push(`@${formatSecondsIntoMinutes(item.from)}`);

  const embed: discord.embed = {
    title: title.length ? title.join(' - ') : 'UNKNOWN',
    description: description.join(' '),
    color: 3035554,
    url: `https://myanimelist.net/anime/${item.anilist.idMal}`,
    fields: [
      {
        name: messageList.sauce.similarity,
        value: `${Math.round(item.similarity * 100)}%`,
      }
    ],
    image: {
      url: item.image,
    },
    footer: {
      text: stringReplacer(messageList.common.page, { page, total }),
    },
  };

  if (item.anilist.synonyms?.length > 0) {
    embed.fields?.push({
      name: messageList.sauce.other_names,
      value: item.anilist.synonyms.join(' | '),
    });
  }

  embed.fields?.push({
    name: `⠀`,
    value: `[Video](${item.video})`,
  });

  return embed;
};

const traceMoeUpdatePage = async (
  data: TraceMoe.resultData,
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app) {
    await editOriginalInteractionResponse(app.id, token, {
      content: '',
      embeds: [traceMoeEmbed(data, page, total)],
    });
  }
};

const requestTraceMoe = async (
  image: string
): Promise<TraceMoe.response | null> => {
  try {
    const result = await downloadFile(image, 'trash/trash.png');

    if (result) {
      const data = new FormData();
      data.append('image', fs.createReadStream('trash/trash.png'));

      const res = await axios.post(
        `https://api.trace.moe/search?anilistInfo`,
        data,
        {
          headers: data.getHeaders(),
        }
      );
      return res.data;
    }

    return null;
  } catch (e) {
    _logger.error('Requestion sauce trace moe', e.toJSON());
  }

  return null;
};

const handleTraceMoe = async (
  data: discord.interaction,
  image: string
): Promise<void> => {
  const app = getApplication();
  if (app) {
    //https://soruly.github.io/trace.moe/#/
    const traceMoe = await requestTraceMoe(image);

    if (!traceMoe || traceMoe.result.length === 0) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.sauce.not_found,
      });
      return;
    }

    const message = await editOriginalInteractionResponse(app.id, data.token, {
      content: '',
      embeds: [traceMoeEmbed(traceMoe.result[0], 1, traceMoe.result.length)],
    });

    if (message) {
      const pagination = new Pagination<TraceMoe.resultData>(
        data.channel_id,
        message.id,
        traceMoe.result,
        traceMoeUpdatePage,
        data.token
      );

      addPagination(pagination);
    }
  }
};

export default handleTraceMoe;
