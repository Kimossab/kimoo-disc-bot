import DiscordRest from "../discord/rest";
import unirest from "unirest";

const malTypes: { [key: string]: string } = {
  manga: "manga",
  anime: "anime",
  person: "person",
  char: "character",
  character: "character"
};

class WeebCommands {

  public static async getAnime(
    guild: discord.guild,
    trigger: string,
    messageData: discord.message,
    data: string[]
  ) {
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
            key: "noanime",
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

  public static async searchMal(
    guild: discord.guild,
    trigger: string,
    messageData: discord.message,
    data: string[]
  ) {
    try {
      // valid parameters
      if (data[1] === "") {
        return DiscordRest.sendInfo(messageData.channel_id, guild, "searchmal", trigger);
      }

      let type = "anime";
      let query = null;

      let firstPart = data[1].substring(0, data[1].indexOf(" ")).toLowerCase();
      if (Object.keys(malTypes).includes(firstPart)) {
        type = firstPart;
        query = data[1].substring(data[1].indexOf(" ") + 1);
      } else {
        query = data[1];
      }

      const queryResult = await WeebCommands.malRequest(malTypes[type], query);

      return DiscordRest.sendMessage(
        messageData.channel_id,
        queryResult.categories[0].items[0].url
      );
    } catch (e) {
      console.log("searchMal", e);
    }
  }

  private static async malRequest(
    type: string,
    query: string
  ): Promise<MAL.search_response> {
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
}

export default WeebCommands;

