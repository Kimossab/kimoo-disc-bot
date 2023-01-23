declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_DOMAIN: string;
      API_V: number;
      TOKEN: string;
      SAUCENAO_API_KEY: string;
      OPENGRAPH_API_KEY: string;
      DATABASE_URL: string;
      //modules
      BIRTHDAY_MODULE: "true" | "false";
      ACHIEVEMENT_MODULE: "true" | "false";
      BADGES_MODULE: "true" | "false";
      FANDOM_MODULE: "true" | "false";
      SAUCE_MODULE: "true" | "false";
      MISC_MODULE: "true" | "false";
      VNDB_MODULE: "true" | "false";
      ANILIST_MODULE: "true" | "false";
      OWNER_DM_CHANNEL?: string;
    }
  }
}

export {};
