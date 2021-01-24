import util from "util";
import { colors } from "./constants";

let currentColor = 1;

/**
 * Class that handles logging of stuff
 */
class Logger {
  private _color = colors.white;
  private _module;

  constructor(module: string, color?: colors) {
    this._module = module;
    if (color !== undefined) {
      this._color = color;
    } else {
      this._color = currentColor++;

      if (currentColor > 9) {
        currentColor = 1;
      }
    }
  }

  /**
   * Prints the log on the console and all the variables given
   * @param message Message to write
   * @param data Variables to log
   */
  public log(message: string | null | undefined, ...data: any) {
    const timeString = new Date().toLocaleTimeString();
    const colStr = `\x1b[${90 + this._color}m`;

    console.log(
      `${colStr}[${timeString}][${this._module}]`,
      message,
      "\x1b[0m"
    );
    if (data.length) {
      for (const d of data) {
        console.log(`${colStr}•\x1b[0m`, util.inspect(d, false, null, true));
      }
    }
  }

  /**
   * Prints the log as an error on the console and all the variables given
   * @param message Message to write
   * @param data Variables to log
   */
  public error(message: string, ...data: any) {
    const timeString = new Date().toLocaleTimeString();
    const colStr = `\x1b[5;${90 + colors.white};${100 + colors.red}m`;

    console.log(
      `${colStr}[${timeString}][${this._module}]`,
      message,
      "\x1b[0m"
    );
    if (data.length) {
      for (const d of data) {
        console.log(
          `${colStr}•`,
          util.inspect(d, false, null, true),
          "\x1b[0m"
        );
      }
    }
  }
}

export default Logger;
