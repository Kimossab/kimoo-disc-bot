
import tlEn from "../resources/translations/en.json";
import tlPt from "../resources/translations/pt.json";

class Helper {

  public static translation(
    server: discord.guild,
    message: string,
    replace: any | null = null
  ) {
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

  public static getObjectChild(object: any, message: string) {
    const childs = message.split(".");
    let returnVal = object;

    for (let child of childs) {
      returnVal = returnVal[child];
    }

    return returnVal;
  };
}

export default Helper;