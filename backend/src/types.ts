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

export type CookiePayload = {
  username: string,
  role: RoleType
}

export const ROLES = {
  user: 1,
  baby: 2,
  admin: 3,
}

export type RoleType = keyof typeof ROLES;
export const RoleArray = Object.keys(ROLES) as [RoleType, ...RoleType[]]
