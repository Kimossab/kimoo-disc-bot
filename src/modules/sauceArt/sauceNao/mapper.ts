// This file is a mess and it's supposed to be, I can't be arsed to handle all edge cases
// I will make changes accordingly to the needs and errors as they arise
// If you're reading this... good luck

import Logger from "@/helper/logger";

export const mapSauceNaoResultToData = (
  data: SauceNao.result,
  logger?: Logger
): SauceNao.data => {
  const parsed: SauceNao.data = {
    name: "",
    site: "Unknown",
    index: data.header.index_id,
    similarity: Number(data.header.similarity),
    authorData: null,
    thumbnail: data.header.thumbnail,
    url: null
  };
  try {
    switch (data.header.index_id) {
      // dunno how this works
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
        // pixiv
        parsed.site = "pixiv";
        parsed.url = [`https://www.pixiv.net/en/artworks/${data.data.pixiv_id}`];
        parsed.name = data.data.title;
        parsed.authorData = {
          authorName: data.data.member_name
            ? data.data.member_name
            : null,
          authorUrl: `https://www.pixiv.net/en/users/${data.data.member_id}`
        };
        break;
      }
      case 8: {
        // Nico Nico
        parsed.site = "Nico Nico Seiga";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.title;
        parsed.authorData = {
          authorName: data.data.member_name
            ? data.data.member_name
            : null,
          authorUrl: null
        };
        break;
      }
      case 9: {
        // danbooru / gelbooru / sankaku
        parsed.site = "danbooru / gelbooru / sankaku";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.material
          ? data.data.material
          : "";
        parsed.authorData = {
          authorName: data.data.creator
            ? data.data.creator.toString()
            : null,
          authorUrl: data.data.source
            ? data.data.source
            : null
        };
        break;
      }
      case 11: {
        // nijie
        parsed.site = "nijie";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.title!;
        parsed.authorData = {
          authorName: data.data.member_name
            ? data.data.member_name
            : null,
          authorUrl: `https://nijie.info/members.php?id=${data.data.member_id}`
        };
        break;
      }
      case 12: {
        // yandere
        parsed.site = "yande.re";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.material!;
        parsed.authorData = {
          authorName: data.data.creator
            ? data.data.creator.toString()
            : null,
          authorUrl: null
        };
        break;
      }
      case 16: {
        // fakku
        parsed.site = "fakku";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.source!;
        parsed.authorData = {
          authorName: data.data.creator
            ? data.data.creator.toString()
            : null,
          authorUrl: null
        };
        break;
      }
      case 18: {
        // nhentai
        parsed.site = "nhentai";
        const match = (/\/nhentai\/(\d*)[^/]*(\/\d*)/gm).exec(data.header.thumbnail);
        if (match) {
          const path = match[1] + match[2];
          // parsed.thumbnail = `https://i.nhentai.net/galleries/${path}.jpg`;
          parsed.url = [
            `https://nhentai.net/g/${match[1]}`,
            `https://nhentai.net/g/${path}`
          ];
        }
        parsed.name = (data.data.eng_name || data.data.jp_name)!;
        parsed.authorData = {
          authorName: (data.data.creator as string[]).join(","),
          authorUrl: null
        };
        break;
      }
      case 20: {
        // MediBang
        parsed.site = "MediBang";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.title;
        parsed.authorData = {
          authorName: data.data.member_name
            ? data.data.member_name
            : null,
          authorUrl: `https://medibang.com/author/${data.data.member_id}/`
        };
        break;
      }
      case 21:
      case 22: {
        // anidb
        parsed.site = "anidb";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.source!;
        break;
      }
      case 24: {
        // imdb
        parsed.site = "imdb";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.source!;
        break;
      }
      case 27: {
        // Sankaku
        parsed.site = "Sankaku";
        parsed.name = data.data.material!;
        parsed.url = data.data.ext_urls;
        parsed.authorData = {
          authorName: data.data.creator
            ? data.data.creator.toString()
            : null,
          authorUrl: null
        };
        break;
      }
      case 31:
      case 32: {
        // bcy
        parsed.site = "bcy";
        parsed.name = data.data.title;
        parsed.url = data.data.ext_urls;
        parsed.authorData = {
          authorName: data.data.member_name
            ? data.data.member_name
            : null,
          authorUrl: data.data.source
            ? data.data.source
            : null
        };
        break;
      }
      case 34: {
        // deviantart
        parsed.site = "deviantart";
        parsed.url = [data.data.ext_urls[0]];
        parsed.name = data.data.title;
        parsed.authorData = {
          authorName: data.data.author_name
            ? data.data.author_name
            : null,
          authorUrl: data.data.author_url
        };
        break;
      }
      case 35: {
        // Pawoo
        parsed.site = "Pawoo";
        parsed.url = [data.data.ext_urls[0] + data.data.pawoo_id];
        parsed.name = "";
        parsed.authorData = {
          authorName: data.data.pawoo_user_display_name
            ? data.data.pawoo_user_display_name
            : null,
          authorUrl: data.data.ext_urls[0]
        };
        break;
      }
      case 36: {
        // MangaUpdates
        parsed.site = "MangaUpdates";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.source!;
        break;
      }
      case 37: {
        // MangaDex
        parsed.site = "MangaDex";
        parsed.url = data.data.ext_urls;
        parsed.name = data.data.source!;
        break;
      }
      case 41: {
        // twitter
        parsed.site = "Twitter";
        parsed.url = data.data.ext_urls;
        parsed.name = `Tweet by ${data.data.twitter_user_handle!}`;
        parsed.authorData = {
          authorName: data.data.twitter_user_handle!,
          authorUrl: `https://twitter.com/${data.data.twitter_user_handle!}/`
        };
        break;
      }
      case 371: {
        // some manga list
        const nameSplit = data.header.index_name.split(" ");
        const page = nameSplit[nameSplit.length - 1].split(".")[0];
        parsed.name = data.data.source! + data.data.part!;
        parsed.site = "MangaDex";
        parsed.url = [data.data.ext_urls[0] + page, ...data.data.ext_urls];
        parsed.authorData = {
          authorName: data.data.author!,
          authorUrl: ""
        };
        break;
      }
      default: {
        logger?.info("fallback", data);
        parsed.fallback = JSON.stringify(data);
      }
    }
  } catch (e) {
    logger?.error("formatSauceNaoData", e, data);
    parsed.fallback = JSON.stringify(data);
  }

  return parsed;
};
