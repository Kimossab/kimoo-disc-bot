import { editOriginalInteractionResponse } from "@/discord/rest";
import { interpolator } from "@/helper/common";
import {
  CreatePageCallback,
  InteractionPagination
} from "@/helper/interaction-pagination";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { addPagination } from "@/state/store";

import { mapSauceNaoResultToData } from "./mapper";
import { requestSauceNao } from "./request";
import { APIApplication, APIApplicationCommandInteraction, APIEmbed, ButtonStyle, ComponentType } from "discord-api-types/v10";

const sauceNaoEmbed = (
  item: SauceNao.data,
  page: number,
  total: number
): APIEmbed => {
  const embed: APIEmbed = {
    title: item.name,
    description: item.site,
    color: 3035554,
    fields: [],
    footer: {
      text: interpolator(messageList.common.page, {
        page,
        total
      })
    }
  };
  if (item.thumbnail) {
    embed.image = {
      url: item.thumbnail.replace(/\s/g, "%20")
    };
  }

  embed.fields = [
    ...embed.fields ?? [],
    {
      name: "similarity",
      value: item.similarity.toString()
    }
  ];

  if (item.url) {
    for (const st of item.url) {
      embed.fields = [
        ...embed.fields ?? [],
        {
          name: "url",
          value: st
        }
      ];
    }
  }

  if (item.authorData) {
    embed.fields = [
      ...embed.fields ?? [],
      {
        name: item.authorData.authorName
          ? item.authorData.authorName
          : "-",
        value: item.authorData.authorUrl
          ? item.authorData.authorUrl
          : "-"
      }
    ];
  }
  if (item.fallback) {
    embed.fields = [
      ...embed.fields ?? [],
      {
        name: "unknown fallback",
        value: item.fallback
      }
    ];
  }

  return embed;
};

const sauceNaoUpdatePage: CreatePageCallback<SauceNao.data> = async (
  page,
  total,
  data
) => ({
  data: {
    embeds: [sauceNaoEmbed(data, page, total)],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Secondary,
            custom_id: "sauceArt.select",
            label: "Show to everyone"
          }
        ]
      }
    ]
  }
});

const handleSauceNao = async (
  data: APIApplicationCommandInteraction,
  image: string,
  app: Partial<APIApplication>,
  logger: Logger
): Promise<void> => {
  const saucenao = await requestSauceNao(image, logger);

  if (!saucenao) {
    await editOriginalInteractionResponse(app.id || "", data.token, {
      content: messageList.sauce.not_found
    });
    return;
  }

  if (saucenao.header.status > 0) {
    logger.error("SauceNao - Ext error", saucenao);
    await editOriginalInteractionResponse(app.id || "", data.token, {
      content: messageList.sauce.not_found
    });
    return;
  }

  if (saucenao.header.status < 0) {
    logger.error("SauceNao - Int error", saucenao);
    await editOriginalInteractionResponse(app.id || "", data.token, {
      content: messageList.sauce.not_found
    });
    return;
  }

  let resData: SauceNao.data[] = [];
  for (const res of saucenao.results) {
    resData.push(mapSauceNaoResultToData(res, logger));
  }

  // sort and filter
  resData = resData.sort((a, b) => b.similarity - a.similarity);
  resData = resData.filter((a) => a.similarity > 75);

  if (resData.length === 0) {
    await editOriginalInteractionResponse(app.id || "", data.token, {
      content: messageList.sauce.not_found
    });
    return;
  }

  const pagination = new InteractionPagination(
    app.id || "",
    resData,
    sauceNaoUpdatePage
  );

  await pagination.create(data.token);
  addPagination(pagination as InteractionPagination);
};

export default handleSauceNao;
