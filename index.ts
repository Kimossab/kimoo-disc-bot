import dotenv from "dotenv";
import DiscordRest from "./src/discord/rest";
import DiscordSocket from "./src/discord/socket";
import DB from "./src/database";
import Helper from "./src/helper";

dotenv.config();

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

/**
 * Bot Start class
 */
class Bot {
  // private db: DB;

  constructor() {
    // this.db = new DB();
    // this.db.start();
  }

  /**
   * Runs the bot
   */
  async run() {
    try {
      // Get discrod gateway
      const response = await DiscordRest.getGatewayBot();
      if (response.session_start_limit.remaining === 0) {
        return setTimeout(() => { this.run(); }, response.session_start_limit.reset_after);
      }

      const urlParams = "/?v=" + process.env.API_V + "&encoding=json";
      const url = response.url + urlParams;

      // Starts the socket client
      const socket = new DiscordSocket(url);
      socket.connect();
    } catch (e) {
      console.log(e);
    }
  }
}

// Actually start the bot
try {
  const _ = new Bot();
  _.run();
} catch (e) {
  console.log('fatal error', e);
}