
import tlEn from "../resources/translations/en.json";
import tlPt from "../resources/translations/pt.json";
import DiscordSocket from "./discord/socket";

/**
 * Static class with helper functions
 */
class Helper {

  /**
   * Gets a message translated.
   * ***
   * @param server Discord guild
   * @param message Message key
   * @param replace Optional replacing data
   */
  public static translation(server: discord.guild, message: string, replace: string_object<string> | null = null) {
    let returnMessage = "";

    if (!server) {
      returnMessage = Helper.getObjectChild(tlEn, message);
    } else {
      switch (server.settings.bot_lang) {
        case "pt":
          returnMessage = Helper.getObjectChild(tlPt, message);
          break;
        default:
          returnMessage = Helper.getObjectChild(tlEn, message);
          break;
      }
    }

    if (replace) {
      for (let i in replace) {
        returnMessage = returnMessage.replace(`<${i.toString()}>`, replace[i]);
      }
    }

    return typeof returnMessage === "undefined" ? "" : returnMessage;
  }

  /**
   * Searches on an object for the value with the string notation  
   * 
   * Example get the value of `object.a.b.c` through a string:
   * ```typescript
   * getObjectChild({a:{b:{c:'c'}}}, 'a.b.c');
   * ```
   * ***
   * @param object Object to search
   * @param stringNotation String notation of the object to get
   */
  public static getObjectChild(object: any, stringNotation: string) {
    const childs = stringNotation.split(".");
    let returnVal = object;

    for (let child of childs) {
      returnVal = returnVal[child];
    }

    return returnVal;
  }

  /**
   * Will search for the first user found on the server that matches the given user.
   * This searches for id, nickname, username and username with discriminator.
   * All names (given and from the guild) are lower cased for easier search.
   * Be careful with users with same name
   * ***
   * @param guild Discord guild to search
   * @param user User name, id, nickname or name with discriminator
   */
  public static findUser(guild: discord.guild, user: string): discord.user | null {
    const auxUser = user.toLowerCase();
    if (guild.members) {
      for (const m of guild.members) {
        if (
          m.user.id === user ||
          m.nick?.toLowerCase() === auxUser ||
          m.user.username.toLowerCase() === auxUser ||
          m.user.username.toLowerCase() + '#' + m.user.discriminator === auxUser
        ) {
          return m.user;
        }
      }
    }

    return null;
  }

  /**
   * Gets the trigger of this server, or the default trigger if not found.
   * ***
   * @param guild Discord guild object
   */
  public static getTrigger(guild: discord.guild): string {
    const defaultTrigger = process.env.DEFAULT_CMD_TRIGGER ?? '..';

    if (!guild || !guild.settings) {
      return defaultTrigger
    }

    return guild.settings.cmd_trigger ?? defaultTrigger;
  }

  /**
   * Converts a snowflake string from Discord into a Date object.
   * ***
   * @param snowflake Snowflake string given by Discord
   */
  public static snowflakeToDate(snowflake: string): Date {
    return new Date(Number(snowflake) / 4194304 + 1420070400000);
  }
}

export default Helper;