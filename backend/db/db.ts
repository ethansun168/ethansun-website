import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema.js";
import * as schema from "./schema.js"
import { eq, InferSelectModel } from "drizzle-orm";
import dotenv from "dotenv";

type User = InferSelectModel<typeof users>

dotenv.config()
console.log("DATABASE_URL:", process.env.DATABASE_URL)

const client = postgres(process.env.DATABASE_URL!, {
  ssl: "require"
})

const db = drizzle(client, { schema })

export async function getUser(username: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  if (!user) {
    return null;
  }
  return user;
}
