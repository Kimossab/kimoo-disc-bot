import Log from "../../logger";
import DiscordSocket from "../../discord/socket";
import unirest from "unirest";
import DiscordRest from "../../discord/rest";
import Queue from "../../discord/queue";

class SauceNao {
  private sauceNaoCache: string_object<discord.embed[]> = {};
  private pageList: SauceNao.message_list[] = [];

  public async sauce(messageData: discord.message): Promise<BotModule.command_response> {

    const socket = DiscordSocket.getInstance();

    const lastAttachment = socket?.lastAttachments[messageData.channel_id];

    if (!lastAttachment) {
      return {
        success: false,
        status: 1,
        data: { message: 'no_image' }
      };
    }

    let sauceData = this.sauceNaoCache[lastAttachment];
    if (!sauceData) {
      const response = await this.sauceNaoRequest(lastAttachment);

      //response validation
      if (response.header.status > 0) {
        return {
          success: false,
          status: 3,
          data: { message: 'ext_error' }
        };
      }
      if (response.header.status < 0) {
        return {
          success: false,
          status: 4,
          data: { message: 'int_error' }
        };
      }

      sauceData = [];
      let requestData: SauceNao.data[] = [];

      for (const res of response.results) {
        requestData.push(this.formatSauceNaoData(res));
      }

      // sort and filter
      requestData = requestData.sort((a, b) => b.similarity - a.similarity);
      requestData = requestData.filter(a => a.similarity > 75);

      // pagination
      let page = 1;
      for (const d of requestData) {
        sauceData.push(this.sauceNaoEmbed(d, page++, requestData.length));
      }

      this.sauceNaoCache[lastAttachment] = sauceData;
    }

    if (sauceData.length === 0) {
      return {
        success: false,
        status: 2,
        data: { message: 'no_data' }
      };
    }

    let message = await DiscordRest.sendMessage(messageData.channel_id, "", sauceData[0]);

    this.pageList.push({
      message: message.id,
      items: sauceData,
      currentPage: 0
    });

    const queue = Queue.getInstance();
    queue.add(DiscordRest.addReaction, [messageData.channel_id, message.id, "⬅"]);
    queue.add(DiscordRest.addReaction, [messageData.channel_id, message.id, "➡"]);

    return {
      success: true,
      status: 0,
      data: null
    };
  }

  public handlePageChange(message: string, channel: string, emoji: string) {
    const page = this.pageList.find(p => p.message === message);
    if (!page) {
      return false;
    }

    page.currentPage += emoji === "⬅" ? -1 : 1;

    if (page.currentPage === page.items.length) {
      page.currentPage = 0;
    } else if (page.currentPage < 0) {
      page.currentPage = page.items.length - 1;
    }

    DiscordRest.editMessage(page.message, channel, "", page.items[page.currentPage]);

    return true;
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
            authorName: data.data.creator ? data.data.creator.toString() : null,
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
            authorName: data.data.creator ? data.data.creator.toString() : null,
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
            authorName: data.data.creator ? data.data.creator.toString() : null,
            authorUrl: null
          };
          break;
        }
        case 18: {
          //nhentai
          parsed.site = "nhentai";
          const match = /\/nhentai\/(\d*)[^\/]*(\/\d*)/gm.exec(data.header.thumbnail);
          if (match) {
            const path = match[1] + match[2];
            // parsed.thumbnail = `https://i.nhentai.net/galleries/${path}.jpg`;
            parsed.url = [`https://nhentai.net/g/${match[1]}`, `https://nhentai.net/g/${path}`];
          }
          parsed.name = (data.data.eng_name || data.data.jp_name)!;
          parsed.authorData = {
            authorName: (data.data.creator as string[]).join(','),
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
            authorName: data.data.creator ? data.data.creator.toString() : null,
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
      Log.write('SauceNao', '[ERROR] formatSauceNaoData', e, data);
      parsed.fallback = JSON.stringify(data);
    }

    return parsed;
  }

  private async sauceNaoRequest(image: string): Promise<SauceNao.response> {
    return new Promise((resolve, reject) => {
      Log.write('weeb', `requesting [https://saucenao.com/search.php?output_type=2&api_key=${process.env.SAUCENAO_API_KEY}&testmode=1&url=${image}]`);
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
      fields: [],
      footer: {
        text: `Page ${index}/${count}`
      }
    };
    if (item.thumbnail) {
      embed.image = { url: item.thumbnail.replace(/\s/g, '%20') };
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
}

export default SauceNao;