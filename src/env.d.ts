declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_DOMAIN: string;
      API_V: number;
      TOKEN: string;
      SAUCENAO_API_KEY: string;
      OPENGRAPH_API_KEY: string;
      DATABASE_URL: string;
    }
  }
}

export {};
