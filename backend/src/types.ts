import { createDb } from "../db/db.js";

// Environment variables
type Bindings = {
  DB: D1Database;
  COOKIE_SECRET: string;
  B2_KEY_ID: string;
  B2_APP_KEY: string;
  B2_ENDPOINT: string;
  B2_BUCKET_NAME: string;
};

type Variables = {
  db: ReturnType<typeof createDb>
}

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables
}
