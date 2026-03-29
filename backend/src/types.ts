import { createDb } from "../db/db.js";

export type Bindings = {
  DB: D1Database;
  COOKIE_SECRET: string;
};

export type Variables = {
  db: ReturnType<typeof createDb>
}
