import sqlite3 from "sqlite3";

class DB {
  private db: sqlite3.Database;

  constructor() {
    sqlite3.verbose();

    const dbPath = process.env.DATABASE ? process.env.DATABASE : 'database.db';
    this.db = new sqlite3.Database(dbPath);
  }

  public start() {
    this.db.run(
      "CREATE TABLE IF NOT EXISTS server_settings ( `id` TEXT UNIQUE PRIMARY KEY, `cmd_trigger` TEXT, `admin_role` TEXT, `bot_lang` TEXT DEFAULT 'EN' )"
    );
  }

  public close() {
    this.db.close();
  }

  public loadServerSettings(server: string): Promise<database.server_settings> {
    return new Promise((resolve, reject) => {
      let sql = "SELECT * FROM server_settings WHERE id = ?";

      this.db.get(sql, [server], (err, row: database.server_settings) => {
        if (err) {
          reject(err);
        }

        resolve(row);
      });
    });
  }
}

export default DB;