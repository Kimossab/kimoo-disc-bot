import fs from 'fs';

/**
 * Static class to write logs.
 * Writes to standard output and to a file as well
 */
class Log {
  /** Static file variable to write to */
  private static file: fs.WriteStream;

  /** Gets or creates a new file instance */
  private static getFileInstance() {
    if (!this.file) {
      this.file = fs.createWriteStream("log.txt", { flags: 'a' });
    }

    return this.file;
  }

  /**
   * Write a log message to standard output and log file.
   * ***
   * @param module Module name to better identify where the log comes from
   * @param message Message to log
   * @param args Any variable(s) to log (will be stringified when written to the file, a variable per line)
   */
  public static write(module: string, message: string, ...args: any[]) {
    const currentDate = new Date();
    const dateMessage = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
    let writeMessage = `[${dateMessage}][${module}] ${message}`;

    console.log(writeMessage);
    for (const a of args) {
      writeMessage += `\n\t- ${JSON.stringify(a)}`;
      console.log(a);
    }

    this.getFileInstance().write(writeMessage + '\n');
  }
}

export default Log;