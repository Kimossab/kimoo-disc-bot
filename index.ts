import dotenv from "dotenv";
import DiscordRest from "./src/discord/rest";
import DiscordSocket from "./src/discord/socket";
import DB from "./src/database";
import Helper from "./src/helper";

dotenv.config();

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

class Bot {
  // private db: DB;

  constructor() {
    // this.db = new DB();
    // this.db.start();
  }

  async run() {
    try {
      const response = await DiscordRest.getGatewayBot();
      if (response.session_start_limit.remaining === 0) {
        return setTimeout(() => { this.run(); }, response.session_start_limit.reset_after);
      }

      const urlParams = "/?v=" + process.env.API_V + "&encoding=json";
      const url = response.url + urlParams;

      const socket = new DiscordSocket(url);
      socket.connect();
    } catch (e) {
      console.log(e);
    }
  }
}
try {
  const _ = new Bot();
  _.run();
} catch (e) {
  console.log('fatal error', e);
}