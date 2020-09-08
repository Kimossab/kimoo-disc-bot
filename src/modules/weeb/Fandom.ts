import unirest from 'unirest';
import Log from '../../logger';
import DiscordRest from '../../discord/rest';
import { FANDOM_LINKS } from "../../definitions";
import Queue from '../../discord/queue';

class Fandom {
  private wikiMessageList: fandom.message_list[] = [];
  private queryCache: fandom.query_cache[] = [];
  private pageCache: fandom.page_cache[] = [];

  /**
   * Received request to search a fandom
   * ***
   * @param guild Guild from the message
   * @param trigger Guild command trigger
   * @param messageData Message received
   * @param data Message content
   */
  public async searchWiki(guild: discord.guild, messageData: discord.message, data: string[]): Promise<BotModule.command_response> {
    // valid parameters
    // ..wiki <slug> <query>
    if (data[1] === "") {
      return {
        success: false,
        status: 1,
        data: { message: 'no parameters' }
      };
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

          const queue = Queue.getInstance();
          queue.add(DiscordRest.addReaction, [messageData.channel_id, message.id, "⬅"]);
          queue.add(DiscordRest.addReaction, [messageData.channel_id, message.id, "➡"]);

          this.wikiMessageList.push({
            message: message.id,
            fandom: wiki,
            articles: queryResult,
            currentPage: 0
          });

          return {
            success: true,
            status: 0,
            data: null
          };
        }
      }

      return {
        success: false,
        status: 2,
        data: {
          message: 'wiki_fail',
          replaces: {
            query,
            wiki
          }
        }
      };
    } catch (e) {
      Log.write('Fandom', "Error searchWiki", e);
      return {
        success: false,
        status: 2,
        data: {
          message: 'wiki_fail',
          replaces: {
            query,
            wiki
          }
        }
      };
    }
  }

  public async handlePageChange(message: string, channel: string, emoji: string) {
    const page = this.wikiMessageList.find(p => p.message === message);
    if (!page) {
      return false;
    }

    page.currentPage += emoji === "⬅" ? -1 : 1;

    if (page.currentPage === page.articles.items.length) {
      page.currentPage = 0;
    } else if (page.currentPage < 0) {
      page.currentPage = page.articles.items.length - 1;
    }

    const id = page.articles.items[page.currentPage].id;

    const p = await this.fandomPage(page.fandom, id);

    if (p) {
      const embed = this.fandomEmbed(p, id, page.currentPage + 1, page.articles.items.length);

      DiscordRest.editMessage(page.message, channel, "", embed);
    }
    return true;
  }

  /**
   * Makes a request to fandom
   * ***
   * @param wiki fandom slug
   * @param query Search query
   */
  private async fandomQueryRequest(fandom: string, query: string): Promise<fandom.search_response> {
    return new Promise((resolve, _) => {
      Log.write('weeb', `requesting [https://${fandom}.fandom.com/api/v1/Search/List?query=${encodeURIComponent(query)}&limit=20&minArticleQuality=10&batch=1&namespaces=0%2C14]`);
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
    return new Promise((resolve, _) => {
      Log.write('weeb', `requesting [https://${wiki}.fandom.com/api/v1/Articles/Details?ids=${encodeURIComponent(id.toString())}&abstract=255&width=200&height=200]`);
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

}

export default Fandom;