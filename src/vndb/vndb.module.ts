import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from '../discord/rest';
import { stringReplacer } from '../helper/common';
import { interaction_response_type } from '../helper/constants';
import { getOptionValue } from '../helper/modules.helper';
import Pagination from '../helper/pagination';
import {
  addPagination,
  getApplication,
  setCommandExecutedCallback,
} from '../state/actions';
import { LENGTH_TYPE, RELATION_TYPES, VNDB } from './types';
import { VNDBApi, vndb_get_vn } from './vndb-api';
import messageList from '../helper/messages';

let firstSetup = true;
let vndbApi: VNDBApi | null = null;

const codeReplaces = [
  {
    regex: /\[url=([^\]]*)\]([^\[]*)\[\/url\]/gm,
    replace: `[$2]($1)`,
  },
  {
    regex: /"/gm,
    replace: `\'`
  }
];

const replaceDescriptionCodes = (text: string): string => {
  for (const rep of codeReplaces) {
    console.log(rep, text);
    text = text.replace(rep.regex, rep.replace);
  }

  return text;
};

const groupRelations = (
  relations: VNDB.return_data.get_vn_single_relation[]
): string[] => {
  const returnValues: string[] = [];
  const group: string_object<string[]> = {};

  for (const rel of relations) {
    if (group[rel.relation]) {
      group[rel.relation].push(
        `${rel.official ? '' : '[Unofficial] '}[${rel.title
        }](https://vndb.org/v${rel.id})`
      );
    } else {
      group[rel.relation] = [
        `${rel.official ? '' : '[Unofficial] '}[${rel.title
        }](https://vndb.org/v${rel.id})`,
      ];
    }
  }

  let returnStr = '';
  for (const rel in group) {
    if (Object.prototype.hasOwnProperty.call(group, rel)) {
      const relArr = group[rel];

      const relationString = `**${RELATION_TYPES[rel] ? RELATION_TYPES[rel] : rel
        }**\n- ${relArr.join('\n- ')}\n`;

      if (returnStr.length + relationString.length >= 1024) {
        returnValues.push(returnStr);
        returnStr = '';
      }
      returnStr += relationString;
    }
  }

  returnValues.push(returnStr);

  return returnValues;
};

const vndbSearchEmbed = (
  item: vndb_get_vn,
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: `${item.title}`,
    url: `https://vndb.org/v${item.id}`,
    color: 3035554,
    fields: [
      {
        name: 'Rating',
        value: item.rating.toString(),
        inline: true,
      },
      {
        name: 'Length',
        value:
          item.length && LENGTH_TYPE[item.length]
            ? LENGTH_TYPE[item.length]
            : 'Unknwown',
        inline: true,
      },
      {
        name: 'Release Date',
        value: item.released ?? 'N/A',
        inline: true,
      },
      {
        name: 'Languages',
        value: item.languages.join(', '),
        inline: true,
      },
      {
        name: 'Platforms',
        value: item.platforms.join(', '),
        inline: true,
      },
    ],
    footer: {
      text: stringReplacer(messageList.common.page, { page, total }),
    },
  };

  if (item.original) {
    embed.title += ` (${item.original})`;
  }

  if (item.description) {
    embed.description = replaceDescriptionCodes(item.description);
  }

  if (
    item.image &&
    item.image_flagging &&
    item.image_flagging.sexual_avg === VNDB.sexual.safe &&
    item.image_flagging.violence_avg === VNDB.violence.tame
  ) {
    embed.image = {
      url: item.image,
    };
  }

  if (item.relations.length) {
    const groupRel = groupRelations(item.relations);

    for (let index = 0; index < groupRel.length; index++) {
      embed.fields?.push({
        name: index === 0 ? 'Related VNs' : '.',
        value: groupRel[index],
        inline: false,
      });
    }
  }

  return embed;
};

const vndbSearchUpdatePage = async (
  data: vndb_get_vn,
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app) {
    await editOriginalInteractionResponse(app.id, token, {
      content: '',
      embeds: [vndbSearchEmbed(data, page, total)],
    });
  }
};

// COMMAND CALLBACK
const commandExecuted = async (data: discord.interaction): Promise<void> => {
  const app = getApplication();
  if (app) {
    if (data.data && data.data.name === 'vn') {
      await createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.acknowledge_with_source,
      });

      const search = getOptionValue<string>(data.data.options, 'search');

      const result = await vndbApi?.search(search!);

      if (!result || result.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: 'not found',
        });
        return;
      }

      const message = await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: '',
          embeds: [vndbSearchEmbed(result[0], 1, result.length)],
        }
      );

      if (message) {
        const pagination = new Pagination<vndb_get_vn>(
          data.channel_id,
          message.id,
          result,
          vndbSearchUpdatePage,
          data.token
        );

        addPagination(pagination);
      }
    }
  }
};

export const setUp = () => {
  if (firstSetup) {
    vndbApi = new VNDBApi();

    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
