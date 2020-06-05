
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
   * @param replace Replacing data
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
      if (!returnVal[child]) {
        console.log(returnVal, child);
      }
      returnVal = returnVal[child];
    }

    return returnVal;
  }

  public static findUser(guild: discord.guild, user: string): string | null {
    const auxUser = user.toLowerCase();
    if (guild.members) {
      for (const m of guild.members) {
        if (m.user.id === user || m.nick?.toLowerCase() === auxUser || m.user.username.toLowerCase() === auxUser) {
          return m.user.id;
        }
      }
    }

    console.log(guild.members, user);

    return null;
  }

  public static getTrigger(guild: discord.guild): string {
    const socket = DiscordSocket.getInstance();

    if (!guild || !guild.settings) {
      return process.env.DEFAULT_CMD_TRIGGER ?? '..';
    }

    return guild.settings.cmd_trigger ?? process.env.DEFAULT_CMD_TRIGGER ?? '..';
  }
}

export default Helper;