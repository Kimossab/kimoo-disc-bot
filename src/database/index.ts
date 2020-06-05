import sqlite3 from "sqlite3";

class DB {
  private static _instance: DB;
  private db: sqlite3.Database;

  public static getInstance(): DB {
    if (!this._instance) {
      this._instance = new DB();
    }

    return this._instance;
  }

  constructor() {
    sqlite3.verbose();

    const dbPath = process.env.DATABASE ? process.env.DATABASE : 'database.db';
    this.db = new sqlite3.Database(dbPath);
  }

  public start(): void {
    this.db.run("CREATE TABLE IF NOT EXISTS server_settings ( `server_id` TEXT UNIQUE PRIMARY KEY, `cmd_trigger` TEXT, `admin_role` TEXT, `bot_lang` TEXT DEFAULT 'en' );");
    this.db.run("CREATE TABLE IF NOT EXISTS birthdays ( `user_id` TEXT PRIMARY KEY, `server_id` TEXT, `day` INTEGER, `month` INTEGER, `year` INTEGER DEFAULT NULL);");
    this.db.run("CREATE TABLE IF NOT EXISTS birthday_settings ( `server_id` TEXT UNIQUE PRIMARY KEY, `hours` INTEGER DEFAULT 0, `channel` TEXT NOT NULL);");
  }

  public close(): void {
    this.db.close();
  }

  // SELECTS
  public getServerSettings(server: string): Promise<database.server_settings> {
    return new Promise((resolve, reject) => {
      let sql = "SELECT * FROM server_settings WHERE server_id = ?";

      this.db.get(sql, [server], (err, row: database.server_settings) => {
        if (err) {
          reject(err);
        }

        resolve(row);
      });
    });
  }

  public getServerBirthdays(server: string): Promise<database.birthday[]> {
    return new Promise((resolve, reject) => {
      let sql = "SELECT user_id, day, month, year FROM birthdays WHERE server_id = ?";

      this.db.all(sql, [server], (err, rows: database.birthday[]) => {
        if (err) {
          reject(err);
        }

        resolve(rows);
      });
    });
  }

  public getServerBirthdaySettings(server: string): Promise<database.birthday_settings> {
    return new Promise((resolve, reject) => {
      let sql = "SELECT * FROM birthday_settings WHERE server_id = ?";

      this.db.get(sql, [server], (err, row: database.birthday_settings) => {
        if (err) {
          reject(err);
        }

        resolve(row);
      });
    });
  }

  // INSERTS
  public insertServerSettings(settings: database.server_settings) {
    const sql = "INSERT INTO `server_settings` (server_id,  cmd_trigger, admin_role, bot_lang) VALUES (?, ?, ?, ?)";

    this.db.run(sql, [settings.server_id, settings.cmd_trigger, settings.admin_role, settings.bot_lang]);
  }

  public insertOrUpdateBirthday(server: discord.guild, birthday: database.birthday) {
    const sql = "INSERT OR REPLACE INTO `birthdays` (server_id,  user_id, day, month, year) VALUES (?, ?, ?, ?, ?)";

    this.db.run(sql, [server.id, birthday.user_id, birthday.day, birthday.month, birthday.year]);
  }

  // UPSERTS
  public upsertBirthdaySettings(server_id: string, channel: string, time: number): Promise<database.birthday_settings> {
    const sql = "INSERT OR REPLACE INTO `birthday_settings` (server_id,  channel, hours) VALUES (?, ?, ?)";

    this.db.run(sql, [server_id, channel, time ?? 0]);

    return this.getServerBirthdaySettings(server_id);
  }
  // UPDATES
  public updateServerSettings(settings: database.server_settings): Promise<database.server_settings> {
    const sql = "UPDATE `server_settings` SET cmd_trigger = ?, admin_role = ?, bot_lang = ? WHERE server_id = ?";

    this.db.run(sql, [settings.cmd_trigger, settings.admin_role, settings.bot_lang, settings.server_id]);

    return this.getServerSettings(settings.server_id);
  }

  // OTHERS
  public async getServerData(server: string): Promise<database.server_data> {
    let settings = await this.getServerSettings(server);
    if (!settings) {
      settings = {
        server_id: server,
        cmd_trigger: process.env.DEFAULT_CMD_TRIGGER,
        admin_role: null,
        bot_lang: 'EN'
      };

      this.insertServerSettings(settings);
    }
    const birthdays = await this.getServerBirthdays(server);
    const birthday_settings = await this.getServerBirthdaySettings(server);

    return { settings, birthdays, birthday_settings: birthday_settings ? birthday_settings : null };
  }

}

export default DB;