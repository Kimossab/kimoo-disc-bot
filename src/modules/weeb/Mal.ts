import DiscordRest from "../../discord/rest";
import Queue from "../../discord/queue";
import Log from "../../logger";
import unirest from 'unirest';

class Mal {
  private malTypes: string_object<string> = {
    all: "all",
    manga: "manga",
    anime: "anime",
    person: "person",
    char: "character",
    character: "character"
  };

  private malQueryCache: MAL.cache[] = [];
  private malMessageList: MAL.message_list[] = [];

  /**
   * Received request to search mal
   * ***
   * @param guild Guild from the message
   * @param trigger Guild command trigger
   * @param messageData Message received
   * @param data Message content
   */
  public async searchMal(messageData: discord.message, data: string[]): Promise<BotModule.command_response> {
    try {
      // valid parameters
      if (data[1] === "") {
        return {
          success: false,
          status: 1,
          data: { message: 'no parameters' }
        };
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

        const queue = Queue.getInstance();
        queue.add(DiscordRest.addReaction, [messageData.channel_id, message.id, "⬅"]);
        queue.add(DiscordRest.addReaction, [messageData.channel_id, message.id, "➡"]);

        this.malMessageList.push({
          message: message.id,
          items: queryResult,
          currentPage: 0
        });

        return {
          success: true,
          status: 0,
          data: null
        };
      }

      return {
        success: false,
        status: 2,
        data: { message: "no_data_found" }
      };
    } catch (e) {
      Log.write('weeb', "Error searchMal", e);

      return {
        success: false,
        status: 2,
        data: { message: "no_data_found" }
      };
    }
  }

  public handlePageChange(message: string, channel: string, emoji: string): boolean {
    const page = this.malMessageList.find(m => m.message = message);
    if (!page) {
      return false;
    }

    page.currentPage += emoji === "⬅" ? -1 : 1;

    if (page.currentPage === page.items.length) {
      page.currentPage = 0;
    } else if (page.currentPage < 0) {
      page.currentPage = page.items.length - 1;
    }

    const embed = this.malEmbed(page.items[page.currentPage], page.currentPage + 1, page.items.length);

    DiscordRest.editMessage(message, channel, "", embed);

    return true;
  }

  /**
   * Makes a request to MAL for searching
   * ***
   * @param type Type of query (anime/manga/person/character/all)
   * @param query Search query
   */
  private async malQueryRequest(type: string, query: string): Promise<MAL.search_response> {
    return new Promise((resolve, reject) => {
      Log.write('weeb', `requesting [https://myanimelist.net/search/prefix.json?type=${type}&keyword=${encodeURIComponent(query)}&v=1]`);
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
}

export default Mal;