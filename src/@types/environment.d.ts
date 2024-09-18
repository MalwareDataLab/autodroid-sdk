declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BACKEND_GRAPHQL_ENDPOINT: string;
      FIREBASE_WEB_API_KEY: string;

      USERNAME: string;
      PASSWORD: string;
    }
  }
}

export {};
