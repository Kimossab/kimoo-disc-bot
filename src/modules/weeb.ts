import DiscordRest from "../discord/rest";
import unirest from "unirest";
import { FANDOM_LINKS } from "../definitions";
import { parse } from "dotenv";

/**
 * Adds some weeb functionality
 */
class Weeb {
  private malTypes: string_object<string> = {
    all: "all",
    manga: "manga",
    anime: "anime",
    person: "person",
    char: "character",
    character: "character"
  };

  // private lastMalResult: { [key: string]: MAL.item[] } = {}; 
  private wikiMessageList: fandom.message_list[] = [];
  private queryCache: fandom.query_cache[] = [];
  private pageCache: fandom.page_cache[] = [];

  private malQueryCache: MAL.cache[] = [];
  private malMessageList: MAL.message_list[] = [];

  private sauceNaoCache: string_object<SauceNao.data[]> = {};
  private sauceNaoMessageList: SauceNao.message_list[] = [];

  private lastAttachments: string_object<string> = {};

  // ==================
  // Fandom
  // ==================
  /**
   * Makes a request to fandom
   * ***
   * @param wiki fandom slug
   * @param query Search query
   */
  private async fandomQueryRequest(fandom: string, query: string): Promise<fandom.search_response> {
    return new Promise((resolve, reject) => {
      console.log(`requesting [https://${fandom}.fandom.com/api/v1/Search/List?query=${encodeURIComponent(query)}&limit=20&minArticleQuality=10&batch=1&namespaces=0%2C14]`);
      unirest
        .get(`https://${fandom}.fandom.com/api/v1/Search/List?query=${encodeURIComponent(query)}&limit=20&minArticleQuality=10&batch=1&namespaces=0%2C14`)
        .then((r: any) => {
          resolve(r.body);
        });
    });
  }

  /**
   * Makes a request of a fandom page
   * ***
   * @param wiki fandom slug
   * @param id Page ID
   */
  private async fandomPageRequest(wiki: string, id: number): Promise<fandom.page> {
    return new Promise((resolve, reject) => {
      console.log(`requesting [https://${wiki}.fandom.com/api/v1/Articles/Details?ids=${encodeURIComponent(id.toString())}&abstract=255&width=200&height=200]`);
      unirest
        .get(`https://${wiki}.fandom.com/api/v1/Articles/Details?ids=${encodeURIComponent(id.toString())}&abstract=255&width=200&height=200`)
        .then((r: any) => {
          resolve(r.body);
        });
    });
  }

  /**
   * Uses cache or makes a new request to fandom
   * ***
   * @param wiki fandom slug
   * @param query Search query
   */
  private async fandomQuery(wiki: string, query: string) {
    const cache = this.queryCache.find(c => c.fandom === wiki && c.query === query);
    let result: fandom.search_response | null = null;
    //tries to get from cache otherwise request it
    if (!cache) {
      result = await this.fandomQueryRequest(wiki, query);
      if (result && result.items.length > 0) {
        this.queryCache.push({
          fandom: wiki,
          query: query,
          result: result
        });
      } else {
        return null
      }
    } else {
      result = cache.result;
    }

    return result;
  }

  /**
   * Uses cache or makes a new request of a fandom page
   * ***
   * @param wiki fandom slug
   * @param id Page ID
   */
  private async fandomPage(wiki: string, id: number) {
    const cache = this.pageCache.find(c => c.fandom === wiki && c.id === id);
    let result: fandom.page | null = null;
    if (!cache) {
      result = await this.fandomPageRequest(wiki, id);
      if (result && Object.keys(result.items).length > 0) {
        this.pageCache.push({
          fandom: wiki,
          id: id,
          page: result
        });
      } else {
        return null;
      }
    } else {
      result = cache.page;
    }

    return result;
  }

  /**
   * Creates the embed to show the results
   * ***
   * @param page Page request result
   * @param id Page id
   * @param pIndex Current page for the query
   * @param total Total of pages for the query
   */
  private fandomEmbed(page: fandom.page, id: number, pIndex: number, total: number): discord.embed {
    return {
      title: page.items[id].title,
      description: page.items[id].abstract,
      color: 6465461,
      image: {
        url: page.items[id].thumbnail
      },
      fields: [{
        name: 'URL',
        value: page.basepath + page.items[id].url
      }],
      footer: {
        text: `Page ${pIndex}/${total}`
      }
    };
  }

  // ==================
  // Kitsu
  // ==================
  /**
   * Makes a query request to kitsu
   * ***
   * @param query Search Query
   */
  // private async kitsuQueryRequest(query: string): Promise<kitsu.search_response> {
  //   return new Promise((resolve, reject) => {
  //     unirest
  //       .get(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}`)
  //       .headers({
  //         Accept: "application/vnd.api+json",
  //         "Content-Type": "application/vnd.api+json"
  //       })
  //       .then((r: any) => {
  //         resolve(r.body);
  //       });
  //   });
  // }


  // ==================
  // MAL
  // ==================
  /**
   * Makes a request to MAL for searching
   * ***
   * @param type Type of query (anime/manga/person/character/all)
   * @param query Search query
   */
  private async malQueryRequest(type: string, query: string): Promise<MAL.search_response> {
    return new Promise((resolve, reject) => {
      console.log(`requesting [https://myanimelist.net/search/prefix.json?type=${type}&keyword=${encodeURIComponent(query)}&v=1]`);
      unirest
        .get(
          `https://myanimelist.net/search/prefix.json?type=${type}&keyword=${encodeURIComponent(query)}&v=1`
        )
        .headers({
          "Content-Type": "application/json;"
        })
        .then((r: any) => {
          resolve(r.body);
        });
    });
  }

  /**
   * Uses cache or makes a new request to mal
   * ***
   * @param type Type of query (anime/manga/person/character/all)
   * @param query Search query
   */
  private async malQuery(type: string, query: string) {
    const cache = this.malQueryCache.find(m => m.type === type && m.query === query);

    let result = null;
    if (!cache) {
      let req = await this.malQueryRequest(type, query);
      if (req) {
        result = [];
        for (const cat of req.categories) {
          for (const item of cat.items) {
            result.push(item);
          }
        }

        result.sort((a, b) => {
          return a.es_score > b.es_score ? -1 : 1;
        });

        this.malQueryCache.push({
          type,
          query,
          response: result
        });
      } else {
        return null;
      }
    } else {
      result = cache.response;
    }

    return result;
  }

  private malEmbed(item: MAL.item, index: number, count: number): discord.embed {
    const embed: discord.embed = {
      title: item.name,
      description: item.url,
      color: 3035554,
      image: {
        url: item.image_url
      },
      provider: {
        name: "My Anime List",
        url: "https://myanimelist.net/"
      },
      fields: [],
      footer: {
        text: `Page ${index}/${count}`
      }
    };

    if (item.payload && (item.payload as MAL.anime_payload).media_type) {
      const payload: MAL.anime_payload = (item.payload as MAL.anime_payload);
      embed.fields?.push({
        name: `Type: ${payload.media_type}`,
        value: payload.aired ? payload.aired : payload.published!
      });
    } else if (item.payload && (item.payload as MAL.char_payload).related_works) {
      const payload: MAL.char_payload = (item.payload as MAL.char_payload);
      embed.fields?.push({
        name: "Favorites",
        value: payload.favorites.toString(),
        inline: false
      });

      for (const work of payload.related_works) {
        embed.fields?.push({
          name: "Related Work",
          value: work,
          inline: false
        });
      }
    }
    return embed;
  }

  // ==================
  // Sauce NAO 
  // ==================
  private async sauceNaoRequest(image: string): Promise<SauceNao.response> {
    return new Promise((resolve, reject) => {
      console.log(`requesting [https://saucenao.com/search.php?output_type=2&api_key=${process.env.SAUCENAO_API_KEY}&testmode=1&url=${image}]`);
      unirest
        .get(
          `https://saucenao.com/search.php?output_type=2&api_key=${process.env.SAUCENAO_API_KEY}&testmode=1&url=${image}`
        )
        .then((r: any) => {
          resolve(r.body);
        });
    });
  }

  private sauceNaoEmbed(item: SauceNao.data, index: number, count: number): discord.embed {

    const embed: discord.embed = {
      title: item.name,
      description: item.site,
      color: 3035554,
      provider: {
        name: item.site,
        url: ""
      },
      fields: [],
      footer: {
        text: `Page ${index}/${count}`
      }
    };
    if (item.thumbnail) {
      embed.image = { url: item.thumbnail };
    }

    embed.fields!.push({
      name: `similarity`,
      value: item.similarity.toString()
    });

    if (item.url) {
      for (const st of item.url) {
        embed.fields!.push({
          name: `url`,
          value: st
        });
      }
    }

    if (item.authorData) {
      embed.fields!.push({
        name: item.authorData.authorName ? item.authorData.authorName : '-',
        value: item.authorData.authorUrl ? item.authorData.authorUrl : '-',
      })
    }
    if (item.fallback) {
      embed.fields!.push({
        name: "unknown fallback",
        value: item.fallback,
      })
    }

    return embed;
  }

  // ==================
  // Command Handling
  // ==================
  /**
   * Received request to search a fandom
   * ***
   * @param guild Guild from the message
   * @param trigger Guild command trigger
   * @param messageData Message received
   * @param data Message content
   */
  public async searchWiki(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    // valid parameters
    // ..wiki <slug> <query>
    if (data[1] === "") {
      return DiscordRest.sendInfo(messageData.channel_id, guild, "wiki", trigger);
    }

    const firstSpace = data[1].indexOf(" ");
    const fandomSlug = data[1].substring(0, firstSpace).toLowerCase();
    const query = data[1].substring(firstSpace + 1);

    const wiki = FANDOM_LINKS[fandomSlug] ? FANDOM_LINKS[fandomSlug] : fandomSlug;

    try {
      const queryResult = await this.fandomQuery(wiki, query);

      if (queryResult) {
        const id = queryResult.items[0].id;

        const page = await this.fandomPage(wiki, id);
        if (page) {

          const embed = this.fandomEmbed(page, id, 1, queryResult.items.length);

          let message = await DiscordRest.sendMessage(messageData.channel_id, "", embed);

          DiscordRest.addReaction(messageData.channel_id, message.id, "⬅"); //arrow left
          setTimeout(() => {
            DiscordRest.addReaction(messageData.channel_id, message.id, "➡"); //arrow right
          }, 500);

          this.wikiMessageList.push({
            message: message.id,
            fandom: wiki,
            articles: queryResult,
            currentPage: 0
          });

          return;
        }

      }

      return DiscordRest.sendError(messageData.channel_id, guild, {
        key: "errors.weeb.wiki_fail",
        replaces: { query: query, wiki: wiki }
      });
    } catch (e) {
      console.error(e);
      return DiscordRest.sendError(messageData.channel_id, guild, {
        key: "errors.weeb.wiki_fail",
        replaces: { query: query, wiki: wiki }
      });
    }
  }

  /**
   * Received request to search mal
   * ***
   * @param guild Guild from the message
   * @param trigger Guild command trigger
   * @param messageData Message received
   * @param data Message content
   */
  public async searchMal(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    try {
      // valid parameters
      if (data[1] === "") {
        return DiscordRest.sendInfo(messageData.channel_id, guild, "searchmal", trigger);
      }

      let type = "all";
      let query = null;

      const firstSpace = data[1].indexOf(" ");
      let firstPart = data[1].substring(0, firstSpace).toLowerCase();

      if (Object.keys(this.malTypes).includes(firstPart)) {
        type = firstPart;
        query = data[1].substring(data[1].indexOf(" ") + 1);
      } else {
        query = data[1];
      }

      const queryResult = await this.malQuery(this.malTypes[type], query);

      if (queryResult) {
        const embed = this.malEmbed(queryResult[0], 1, queryResult.length);

        let message = await DiscordRest.sendMessage(messageData.channel_id, "", embed);

        DiscordRest.addReaction(messageData.channel_id, message.id, "⬅"); //arrow left
        setTimeout(() => {
          DiscordRest.addReaction(messageData.channel_id, message.id, "➡"); //arrow right
        }, 500);

        this.malMessageList.push({
          message: message.id,
          items: queryResult,
          currentPage: 0
        });
      }
    } catch (e) {
      console.log("searchMal", e);
    }
  }

  public async handleReaction(message: string, channel: string, emoji: string) {
    if (emoji === "⬅" || emoji === "➡") {
      const wikiIndex = this.wikiMessageList.findIndex(w => w.message === message);

      if (wikiIndex >= 0) {
        let cPage = this.wikiMessageList[wikiIndex].currentPage;
        cPage += (emoji === "⬅" ? -1 : 1);
        if (cPage < 0) {
          cPage = this.wikiMessageList[wikiIndex].articles.items.length - 1;
        } else if (cPage >= this.wikiMessageList[wikiIndex].articles.items.length) {
          cPage = 0;
        }

        this.wikiMessageList[wikiIndex].currentPage = cPage;
        const id = this.wikiMessageList[wikiIndex].articles.items[cPage].id;
        const page = await this.fandomPage(this.wikiMessageList[wikiIndex].fandom, id);
        const embed = this.fandomEmbed(page!, id, cPage + 1, this.wikiMessageList[wikiIndex].articles.items.length);

        DiscordRest.editMessage(message, channel, "", embed);

        return;
      }

      const malIndex = this.malMessageList.findIndex(w => w.message === message);

      if (malIndex >= 0) {
        let cPage = this.malMessageList[malIndex].currentPage;
        cPage += (emoji === "⬅" ? -1 : 1);
        if (cPage < 0) {
          cPage = this.malMessageList[malIndex].items.length - 1;
        } else if (cPage >= this.malMessageList[malIndex].items.length) {
          cPage = 0;
        }

        this.malMessageList[malIndex].currentPage = cPage;
        const embed = this.malEmbed(this.malMessageList[malIndex].items[cPage], cPage + 1, this.malMessageList[malIndex].items.length);

        DiscordRest.editMessage(message, channel, "", embed);

        return;
      }

      const sauceNaoIndex = this.sauceNaoMessageList.findIndex(w => w.message === message);

      if (sauceNaoIndex >= 0) {
        let cPage = this.sauceNaoMessageList[sauceNaoIndex].currentPage;
        cPage += (emoji === "⬅" ? -1 : 1);
        if (cPage < 0) {
          cPage = this.sauceNaoMessageList[sauceNaoIndex].items.length - 1;
        } else if (cPage >= this.sauceNaoMessageList[sauceNaoIndex].items.length) {
          cPage = 0;
        }

        this.sauceNaoMessageList[sauceNaoIndex].currentPage = cPage;
        const embed = this.sauceNaoEmbed(this.sauceNaoMessageList[sauceNaoIndex].items[cPage], cPage + 1, this.sauceNaoMessageList[sauceNaoIndex].items.length);

        DiscordRest.editMessage(message, channel, "", embed);

        return;
      }
    }
  }

  private formatSauceNaoData(data: SauceNao.result): SauceNao.data {
    let parsed: SauceNao.data = {
      name: '',
      site: 'Unknown',
      index: data.header.index_id,
      similarity: Number(data.header.similarity),
      authorData: null,
      thumbnail: data.header.thumbnail,
      url: null
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
          parsed.site = 'pixiv';
          parsed.url = [`https://www.pixiv.net/en/artworks/${data.data.pixiv_id}`];
          parsed.name = data.data.title;
          parsed.authorData = {
            authorName: data.data.member_name ? data.data.member_name : null,
            authorUrl: `https://www.pixiv.net/en/users/${data.data.member_id}`
          };
          break;
        }
        case 8: {
          //Nico Nico
          parsed.site = 'Nico Nico Seiga';
          parsed.url = data.data.ext_urls;
          parsed.name = data.data.title;
          parsed.authorData = {
            authorName: data.data.member_name ? data.data.member_name : null,
            authorUrl: null
          };
          break;
        }
        case 9: {
          //danbooru / gelbooru / sankaku
          parsed.site = "danbooru / gelbooru / sankaku";
          parsed.url = data.data.ext_urls;
          parsed.name = data.data.material ? data.data.material : "";
          parsed.authorData = {
            authorName: data.data.creator ? data.data.creator : null,
            authorUrl: data.data.source ? data.data.source : null
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
            authorUrl: `https://nijie.info/members.php?id=${data.data.member_id}`
          };
          break;
        }
        case 12: {
          //yandere
          parsed.site = "yande.re";
          parsed.url = data.data.ext_urls;
          parsed.name = data.data.material!;
          parsed.authorData = {
            authorName: data.data.creator ? data.data.creator : null,
            authorUrl: null
          };
          break;
        }
        case 16: {
          //fakku
          parsed.site = "fakku";
          parsed.url = data.data.ext_urls;
          parsed.name = data.data.source!;
          parsed.authorData = {
            authorName: data.data.creator ? data.data.creator : null,
            authorUrl: null
          };
          break;
        }
        case 18: {
          //nhentai
          parsed.site = "nhentai";
          const match = /(\/nhentai\/\d*)[^\/]*(\/\d*)\.jpg/gm.exec(data.header.thumbnail);
          if (match) {
            const path = match[1] + match[2];
            parsed.thumbnail = `https://i.nhentai.net/galleries/${path}.jpg`;
            parsed.url = [`https://nhentai.net/g/${match[1]}`, `https://nhentai.net/g/${path}`];
          }
          parsed.name = (data.data.eng_name || data.data.jp_name)!;
          parsed.authorData = {
            authorName: data.data.creator!.concat(','),
            authorUrl: null
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
            authorUrl: `https://medibang.com/author/${data.data.member_id}/`
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
            authorName: data.data.creator ? data.data.creator : null,
            authorUrl: null
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
            authorUrl: data.data.source ? data.data.source : null
          };
          break;
        }
        case 34: {
          //deviantart
          parsed.site = 'deviantart';
          parsed.url = [data.data.ext_urls[0]];
          parsed.name = data.data.title;
          parsed.authorData = {
            authorName: data.data.author_name ? data.data.author_name : null,
            authorUrl: data.data.author_url
          };
          break;
        }
        case 35: {
          //Pawoo
          parsed.site = 'Pawoo';
          parsed.url = [data.data.ext_urls[0] + data.data.pawoo_id];
          parsed.name = "";
          parsed.authorData = {
            authorName: data.data.pawoo_user_display_name ? data.data.pawoo_user_display_name : null,
            authorUrl: data.data.ext_urls[0]
          };
          break;
        }
        case 36: {
          //MangaUpdates
          parsed.site = 'MangaUpdates';
          parsed.url = data.data.ext_urls;
          parsed.name = data.data.source!;
          break;
        }
        case 37: {
          //MangaDex
          parsed.site = 'MangaDex';
          parsed.url = data.data.ext_urls;
          parsed.name = data.data.source!;
          break;
        }
        default: {
          parsed.fallback = JSON.stringify(data);
        }
      }
    } catch (e) {
      console.error(e, data);
      parsed.fallback = JSON.stringify(data);
    }

    return parsed;
  }

  public async sauceNao(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {

    if (!this.lastAttachments[messageData.channel_id]) {
      return DiscordRest.sendError(messageData.channel_id, guild, {
        key: "errors.weeb.sauce_no_image"
      });
    }

    let sauceData = this.sauceNaoCache[this.lastAttachments[messageData.channel_id]];
    if (!sauceData) {
      const response = await this.sauceNaoRequest(this.lastAttachments[messageData.channel_id]);

      if (response.header.status > 0) {
        return DiscordRest.sendError(messageData.channel_id, guild, {
          key: "errors.weeb.sauce_ext_error"
        });
      }
      if (response.header.status < 0) {
        return DiscordRest.sendError(messageData.channel_id, guild, {
          key: "errors.weeb.sauce_int_error"
        });
      }

      sauceData = [];

      for (const res of response.results) {
        sauceData.push(this.formatSauceNaoData(res));
      }

      sauceData = sauceData.sort((a, b) => b.similarity - a.similarity);

      sauceData = sauceData.filter(a => a.similarity > 75);

      this.sauceNaoCache[this.lastAttachments[messageData.channel_id]] = sauceData;
    }

    if (sauceData.length === 0) {
      return DiscordRest.sendError(messageData.channel_id, guild, {
        key: "errors.weeb.sauce_no_sauce"
      });
    }

    const embed = this.sauceNaoEmbed(sauceData[0], 1, sauceData.length);

    let message = await DiscordRest.sendMessage(messageData.channel_id, "", embed);

    DiscordRest.addReaction(messageData.channel_id, message.id, "⬅"); //arrow left
    setTimeout(() => {
      DiscordRest.addReaction(messageData.channel_id, message.id, "➡"); //arrow right
    }, 500);

    this.sauceNaoMessageList.push({
      message: message.id,
      items: sauceData,
      currentPage: 0
    });
  }

  // ===================
  // Attachment Handling
  // ===================
  public processAttachment(channel: string, attachment: discord.attachment) {
    this.lastAttachments[channel] = attachment.url;
  }
}

export default Weeb;

