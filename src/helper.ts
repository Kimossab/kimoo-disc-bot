
import tlEn from "../resources/translations/en.json";
import tlPt from "../resources/translations/pt.json";

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
  public static translation(server: discord.guild, message: string, replace: string_object | null = null) {
    let returnMessage = "";

    if (!server) {
      returnMessage = Helper.getObjectChild(tlEn, message);
    } else {
      switch (server.bot_lang) {
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
  };
}

export default Helper;