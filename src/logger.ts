import fs from 'fs';

class Log {
  private static file: fs.WriteStream;

  private static getInstance() {
    if (!this.file) {
      this.file = fs.createWriteStream("log.txt", { flags: 'a' });
    }

    return this.file;
  }

  public static write(module: string, message: string, ...args: any[]) {
    const currentDate = new Date();
    const dateMessage = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
    let writeMessage = `[${dateMessage}][${module}] ${message}`;

    console.log(writeMessage);
    for (const a of args) {
      writeMessage += `\n\t- ${JSON.stringify(a)}`;
      console.log(a);
    }

    this.getInstance().write(writeMessage + '\n');
  }
}

export default Log;