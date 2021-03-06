import axios from 'axios';
import {
  createInteractionResponse,
  editMessage,
  editOriginalInteractionResponse,
  sendMessage,
} from '../discord/rest';
import Logger from '../helper/logger';
import Pagination from '../helper/pagination';
import {
  addPagination,
  getApplication,
  setCommandExecutedCallback,
} from '../state/actions';
import { interaction_response_type } from '../helper/constants';
import { stringReplacer } from '../helper/common';
import messageList from '../helper/messages';
import { getOptionValue } from '../helper/modules.helper';

const _logger = new Logger('mal');
let firstSetup = true;

const malQuery = async (
  type: string,
  query: string
): Promise<mal.request | null> => {
  try {
    const req = `https://myanimelist.net/search/prefix.json?type=${
      type ? type : 'all'
    }&keyword=${encodeURIComponent(query)}&v=1`;

    _logger.log('Mal request', req);

    const res = await axios.get(req);

    return res.data;
  } catch (e) {
    _logger.error('Mal request error', e);
    return null;
  }
};

const createEmbed = (
  data: mal.item,
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: data.name,
    color: 3035554,
    url: data.url,
    image: {
      url: data.image_url,
    },
    provider: {
      name: 'My Anime List',
      url: 'https://myanimelist.net/',
    },
    fields: [],
    footer: {
      text: stringReplacer(messageList.common.page, { page, total }),
    },
  };

  if (data.type === 'manga') {
    const payload = data.payload as mal.manga;
    embed.fields?.push({
      name: stringReplacer(messageList.mal.type, { type: payload.media_type }),
      value: payload.published,
    });
    embed.fields?.push({
      name: messageList.mal.score,
      value: payload.score,
    });
    embed.fields?.push({
      name: messageList.mal.status,
      value: payload.status,
    });
  } else if (data.type === 'anime') {
    const payload = data.payload as mal.anime;
    embed.fields?.push({
      name: stringReplacer(messageList.mal.type, { type: payload.media_type }),
      value: payload.aired,
    });
    embed.fields?.push({
      name: messageList.mal.score,
      value: payload.score,
    });
    embed.fields?.push({
      name: messageList.mal.status,
      value: payload.status,
    });
  } else if (data.type === 'character') {
    const payload = data.payload as mal.character;

    embed.fields?.push({
      name: messageList.mal.favorites,
      value: payload.favorites.toString(),
    });

    for (const work of payload.related_works) {
      embed.fields?.push({
        name: messageList.mal.related_works,
        value: work,
        inline: false,
      });
    }
  } else if (data.type === 'person') {
    const payload = data.payload as mal.person;

    embed.fields?.push({
      name: messageList.mal.alternative_names,
      value: payload.alternative_name,
    });
    embed.fields?.push({
      name: messageList.mal.birthday,
      value: payload.birthday,
    });
    embed.fields?.push({
      name: messageList.mal.favorites,
      value: payload.favorites.toString(),
    });
  }

  return embed;
};

const updatePage = async (
  data: mal.item,
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app) {
    await editOriginalInteractionResponse(app.id, token, {
      content: '',
      embeds: [createEmbed(data, page, total)],
    });
  }
};

const commandExecuted = async (data: discord.interaction) => {
  const app = getApplication();
  if (app) {
    if (data.data && data.data.name === 'mal' && data.data.options) {
      await createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.acknowledge_with_source,
      });

      const type = getOptionValue<string>(data.data.options, 'type');
      const query = getOptionValue<string>(data.data.options, 'query');

      const queryResult = await malQuery(type!, query!);

      if (!queryResult) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.mal.not_found,
        });
        return;
      }

      let paginationItems: mal.item[] = [];

      for (const cat of queryResult.categories) {
        for (const item of cat.items) {
          paginationItems.push(item);
        }
      }

      paginationItems = paginationItems.sort((a, b) => b.es_score - a.es_score);

      const embed = createEmbed(paginationItems[0], 1, paginationItems.length);
      const message = await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: '',
          embeds: [embed],
        }
      );
      if (message) {
        const pagination = new Pagination<mal.item>(
          data.channel_id,
          message.id,
          paginationItems,
          updatePage,
          data.token
        );

        addPagination(pagination);
      }
    }
  }
};

export const setUp = () => {
  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
