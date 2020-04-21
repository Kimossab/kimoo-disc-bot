import DiscordRest from "../discord/rest";
import unirest from "unirest";
import { FANDOM_LINKS } from "../definitions";

const malTypes: { [key: string]: string } = {
  all: "all",
  manga: "manga",
  anime: "anime",
  person: "person",
  char: "character",
  character: "character"
};

let lastMalResult: { [key: string]: MAL.item[] } = {};

class WeebCommands {

  public static async getAnime(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    try {
      // valid parameters
      if (data[1] === "") {
        return DiscordRest.sendInfo(messageData.channel_id, guild, "getanime", trigger);
      }

      let source = "mal";
      let query: string;

      let firstPart = data[1].substring(0, data[1].indexOf(" ")).toLowerCase();
      if (firstPart === "mal" || firstPart === "kitsu") {
        source = firstPart;
        query = data[1].substring(data[1].indexOf(" ") + 1);
      } else {
        query = data[1];
      }

      if (source === "kitsu") {
        const queryResult = await WeebCommands.kitsuRequest(query);

        const count = queryResult.meta.count;
        if (count === 0) {
          return DiscordRest.sendError(messageData.channel_id, guild, {
            key: "errors.weeb.noanime",
            replaces: { query: query, source: source }
          });
        }

        const anime = queryResult.data[0];

        return DiscordRest.sendMessage(
          messageData.channel_id,
          `https://kitsu.io/anime/${anime.attributes.slug}`
        );
      } else if (source === "mal") {
        const queryResult = await WeebCommands.malRequest("anime", query);

        return DiscordRest.sendMessage(
          messageData.channel_id,
          queryResult.categories[0].items[0].url
        );
      }
    } catch (e) {
      console.log("getAnime", e);
    }
  }

  public static async searchMal(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    try {
      // valid parameters
      if (data[1] === "") {
        return DiscordRest.sendInfo(messageData.channel_id, guild, "searchmal", trigger);
      }

      let type = "all";
      let query = null;

      let firstPart = data[1].substring(0, data[1].indexOf(" ")).toLowerCase();
      if (Object.keys(malTypes).includes(firstPart)) {
        type = firstPart;
        query = data[1].substring(data[1].indexOf(" ") + 1);
      } else {
        query = data[1];
      }

      const queryResult = await WeebCommands.malRequest(malTypes[type], query);

      lastMalResult[messageData.channel_id] = [];
      for (const cat of queryResult.categories) {
        for (const item of cat.items) {
          lastMalResult[messageData.channel_id].push(item);
        }
      }

      lastMalResult[messageData.channel_id].sort((a, b) => {
        return a.es_score > b.es_score ? -1 : 1;
      });

      let fields: discord.embed_field[] = [];
      for (const index in lastMalResult[messageData.channel_id]) {
        if (lastMalResult[messageData.channel_id].hasOwnProperty(index)) {
          const item = lastMalResult[messageData.channel_id][index];

          let name = item.name;

          if ((item.payload as MAL.char_payload).related_works && (item.payload as MAL.char_payload).related_works.length > 0) {
            name += ` - ${(item.payload as MAL.char_payload).related_works[0]}`;
          }

          fields.push({
            name: `${index}: ${item.type}`,
            value: name,
            inline: false
          });
        }
      }

      const embed: discord.embed = {
        title: "MAL Result",
        description: "Pick one",
        color: 3035554,
        provider: {
          name: "My Anime List",
          url: "https://myanimelist.net/"
        },
        fields: fields
      }

      return DiscordRest.sendMessage(
        messageData.channel_id,
        "",
        embed
      );
    } catch (e) {
      console.log("searchMal", e);
    }
  }

  private static async malRequest(type: string, query: string): Promise<MAL.search_response> {
    return new Promise((resolve, reject) => {
      unirest
        .get(
          `https://myanimelist.net/search/prefix.json?type=${type}&keyword=${escape(
            query
          )}&v=1`
        )
        .headers({
          "Content-Type": "application/json;"
        })
        .then((r: any) => {
          resolve(r.body);
        });
    });
  }

  private static async kitsuRequest(query: string): Promise<kitsu.search_response> {
    return new Promise((resolve, reject) => {
      unirest
        .get(`https://kitsu.io/api/edge/anime?filter[text]=${escape(query)}`)
        .headers({
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json"
        })
        .then((r: any) => {
          resolve(r.body);
        });
    });
  }

  private static async fandomSearch(fandom: string, query: string): Promise<fandom.search_response> {
    return new Promise((resolve, reject) => {
      console.log(`https://${fandom}.fandom.com/api/v1/Search/List?query=${escape(query)}&limit=1&minArticleQuality=10&batch=1&namespaces=0%2C14`)
      unirest
        .get(`https://${fandom}.fandom.com/api/v1/Search/List?query=${escape(query)}&limit=1&minArticleQuality=10&batch=1&namespaces=0%2C14`)
        .then((r: any) => {
          resolve(r.body);
        });
    });
  }

  private static async fandomGetPage(fandom: string, id: number): Promise<fandom.page> {
    return new Promise((resolve, reject) => {
      unirest
        .get(`https://${fandom}.fandom.com/api/v1/Articles/Details?ids=${escape(id.toString())}&abstract=255&width=200&height=200`)
        .then((r: any) => {
          resolve(r.body);
        });
    });
  }

  public static checkChoice(_guild: discord.guild, messageData: discord.message) {
    const num: number = Number(messageData.content);
    if (num !== NaN && num >= 0 && lastMalResult[messageData.channel_id] && lastMalResult[messageData.channel_id].length > 0 && num < lastMalResult[messageData.channel_id].length - 1) {
      const item = lastMalResult[messageData.channel_id][num];

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
        fields: []
      }

      if (item.payload && (item.payload as MAL.anime_payload).media_type) {
        const payload: MAL.anime_payload = (item.payload as MAL.anime_payload);
        embed.fields?.push({
          name: `Type: ${payload.media_type}`,
          value: payload.aired
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

      return DiscordRest.sendMessage(
        messageData.channel_id,
        "",
        embed
      );
    }
  }

  public static async searchWiki(guild: discord.guild, trigger: string, messageData: discord.message, data: string[]) {
    // valid parameters
    if (data[1] === "") {
      return DiscordRest.sendInfo(messageData.channel_id, guild, "wiki", trigger);
    }

    const firstPart = data[1].substring(0, data[1].indexOf(" ")).toLowerCase();
    const query = data[1].substring(data[1].indexOf(" ") + 1);
    const wiki = FANDOM_LINKS[firstPart] ? FANDOM_LINKS[firstPart] : firstPart;

    try {
      const queryResult = await WeebCommands.fandomSearch(wiki, query);

      if (queryResult.items && queryResult.items.length > 0) {
        const id = queryResult.items[0].id;

        const page = await WeebCommands.fandomGetPage(wiki, id);

        const embed: discord.embed = {
          title: page.items[id].title,
          description: page.items[id].abstract,
          color: 6465461,
          image: {
            url: page.items[id].thumbnail
          },
          fields: [{
            name: 'URL',
            value: page.basepath + page.items[id].url
          }]
        }

        return DiscordRest.sendMessage(messageData.channel_id, "", embed);
      } else {
        return DiscordRest.sendError(messageData.channel_id, guild, {
          key: "errors.weeb.wiki_fail",
          replaces: { query: query, wiki: wiki }
        });
      }
    } catch (e) {
      console.error(e);
      return DiscordRest.sendError(messageData.channel_id, guild, {
        key: "errors.weeb.wiki_fail",
        replaces: { query: query, wiki: wiki }
      });
    }
  }
}

export default WeebCommands;

