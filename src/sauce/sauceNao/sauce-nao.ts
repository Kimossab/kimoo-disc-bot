import { editOriginalInteractionResponse } from "../../discord/rest";
import { stringReplacer } from "../../helper/common";
import Logger from "../../helper/logger";
import messageList from "../../helper/messages";
import {
  addPagination,
  getApplication,
} from "../../state/actions";
import {
  Interaction,
  Application,
  Embed,
} from "../../types/discord";
import { mapSauceNaoResultToData } from "./mapper";
import { requestSauceNao } from "./request";

const sauceNaoEmbed = (
  item: SauceNao.data,
  page: number,
  total: number
): Embed => {
  const embed: Embed = {
    title: item.name,
    description: item.site,
    color: 3035554,
    fields: [],
    footer: {
      text: stringReplacer(messageList.common.page, {
        page,
        total,
      }),
    },
  };
  if (item.thumbnail) {
    embed.image = {
      url: item.thumbnail.replace(/\s/g, "%20"),
    };
  }

  embed.fields!.push({
    name: "similarity",
    value: item.similarity.toString(),
  });

  if (item.url) {
    for (const st of item.url) {
      embed.fields!.push({
        name: "url",
        value: st,
      });
    }
  }

  if (item.authorData) {
    embed.fields!.push({
      name: item.authorData.authorName
        ? item.authorData.authorName
        : "-",
      value: item.authorData.authorUrl
        ? item.authorData.authorUrl
        : "-",
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
  data: SauceNao.data,
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app && app.id) {
    await editOriginalInteractionResponse(
      app.id || "",
      token,
      {
        content: "",
        embeds: [sauceNaoEmbed(data, page, total)],
      }
    );
  }
};

const handleSauceNao = async (
  data: Interaction,
  image: string,
  app: Partial<Application>,
  logger: Logger
): Promise<void> => {
  const saucenao = await requestSauceNao(image, logger);

  if (!saucenao) {
    await editOriginalInteractionResponse(
      app.id || "",
      data.token,
      {
        content: messageList.sauce.not_found,
      }
    );
    return;
  }

  if (saucenao.header.status > 0) {
    logger.error("SauceNao - Ext error", saucenao);
    await editOriginalInteractionResponse(
      app.id || "",
      data.token,
      {
        content: messageList.sauce.not_found,
      }
    );
    return;
  }

  if (saucenao.header.status < 0) {
    logger.error("SauceNao - Int error", saucenao);
    await editOriginalInteractionResponse(
      app.id || "",
      data.token,
      {
        content: messageList.sauce.not_found,
      }
    );
    return;
  }

  let resData: SauceNao.data[] = [];
  for (const res of saucenao.results) {
    resData.push(mapSauceNaoResultToData(res, logger));
  }

  // sort and filter
  resData = resData.sort(
    (a, b) => b.similarity - a.similarity
  );
  resData = resData.filter((a) => a.similarity > 75);

  if (resData.length === 0) {
    await editOriginalInteractionResponse(
      app.id || "",
      data.token,
      {
        content: messageList.sauce.not_found,
      }
    );
    return;
  }

  const message = await editOriginalInteractionResponse(
    app.id || "",
    data.token,
    {
      content: "",
      embeds: [
        sauceNaoEmbed(resData[0], 1, resData.length),
      ],
    }
  );
  if (message && data.channel_id) {
    // const pagination = new Pagination<SauceNao.data>(
    //   data.channel_id,
    //   message.id,
    //   resData,
    //   sauceNaoUpdatePage,
    //   data.token
    // );
    // addPagination(pagination);
  }
};

export default handleSauceNao;
