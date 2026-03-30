import { createDb } from "../db/db.js";

type Bindings = {
  DB: D1Database;
  COOKIE_SECRET: string;
};

type Variables = {
  db: ReturnType<typeof createDb>
}

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables
}
