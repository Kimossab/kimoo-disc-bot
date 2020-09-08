import dotenv from "dotenv";
import DiscordRest from "./src/discord/rest";
import DiscordSocket from "./src/discord/socket";
import DB from "./src/database";
import Birthdays from "./src/modules/birthdays";
import Log from "./src/logger";
import ModuleManager from "./src/modules/ModuleManager";

dotenv.config();

process.on('uncaughtException', function (err) {
  Log.write('app', 'Caught exception: ', err);
  process.exit();
});

/**
 * Bot Start class
 */
class Bot {
  constructor() { }

  /**
   * Runs the bot
   */
  public async run(): Promise<void> {
    try {
      Log.write('app', 'Start run');

      // Get discord gateway
      const response = await DiscordRest.getGatewayBot();

      if (response.session_start_limit.remaining === 0) {
        Log.write('app', `session_start_limit.remaining is 0. Restarting in ${response.session_start_limit.reset_after}`);
        setTimeout(() => { this.run(); }, response.session_start_limit.reset_after);
        return;
      }

      const urlParams = "/?v=" + process.env.API_V + "&encoding=json";
      const url = response.url + urlParams;

      // Starts the socket client
      DiscordSocket.clean();
      const socket = DiscordSocket.setInstance(url);
      socket.connect();

      DB.getInstance().start();
      ModuleManager.getInstance();
      Birthdays.getInstance();
    } catch (e) {
      Log.write('app', `Error. Restarting in 1 min`, e);
      setTimeout(() => { this.run(); }, 1 * 60 * 1000); // 1min
      return;
    }
  }
}

// Actually start the bot

try {
  const _ = new Bot();
  _.run();
} catch (e) {
  Log.write('app', 'fatal error', e);
  DB.getInstance().close();
}