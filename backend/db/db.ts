import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { messages, users } from "./schema.js";
import * as schema from "./schema.js"
import { and, desc, eq, InferSelectModel } from "drizzle-orm";
import dotenv from "dotenv";

type User = InferSelectModel<typeof users>
type Message = InferSelectModel<typeof messages>

dotenv.config()

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

// TODO: make it paginated
export async function getMessages(username: string): Promise<Message[]> {
  return await db.select().from(messages).where(eq(messages.username, username)).orderBy(desc(messages.createdAt))
}

export async function createMessage(username: string, content: string) {
  // Throws
  await db.insert(messages).values({ username, content }).returning()
}

// Returns true if message successfully updated
export async function editMessage(id: string, message: string, username: string): Promise<boolean> {
  const result = await db.update(messages)
    .set({ content: message, createdAt: new Date() })
    .where(and(eq(messages.id, id), eq(messages.username, username)))
    .returning()
  return result.length !== 0
}

// Returns true if message successfully deleted
export async function deleteMessage(id: string, username: string): Promise<boolean> {
  const result = await db.delete(messages)
    .where(and(eq(messages.id, id), eq(messages.username, username)))
    .returning()
  return result.length !== 0
}
