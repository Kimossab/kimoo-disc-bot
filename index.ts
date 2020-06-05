import dotenv from "dotenv";
import DiscordRest from "./src/discord/rest";
import DiscordSocket from "./src/discord/socket";
import DB from "./src/database";
import Birthdays from "./src/modules/birthdays";
import Weeb from "./src/modules/weeb";

dotenv.config();

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

/**
 * Bot Start class
 */
class Bot {
  constructor() {
    DB.getInstance().start();
    Weeb.getInstance();
    Birthdays.getInstance();
  }

  /**
   * Runs the bot
   */
  async run(): Promise<void> {
    try {
      // Get discord gateway
      const response = await DiscordRest.getGatewayBot();
      if (response.session_start_limit.remaining === 0) {
        setTimeout(() => { this.run(); }, response.session_start_limit.reset_after);
        return;
      }

      const urlParams = "/?v=" + process.env.API_V + "&encoding=json";
      const url = response.url + urlParams;

      // Starts the socket client
      DiscordSocket.clean();
      const socket = DiscordSocket.setInstance(url);
      socket.connect();
    } catch (e) {
      console.log(e);
    }
  }
}

// Actually start the bot
const _ = new Bot();
try {
  _.run();
} catch (e) {
  console.log('fatal error', e);
  DB.getInstance().close();
}