import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { messages, users } from "./schema.js";
import * as schema from "./schema.js"
import { and, desc, eq, InferSelectModel } from "drizzle-orm";

type User = InferSelectModel<typeof users>
type Message = InferSelectModel<typeof messages>

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema })
}

export async function getUser(db: DrizzleD1Database<typeof schema>, username: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  if (!user) {
    return null;
  }
  return user;
}

// TODO: make it paginated
export async function getMessages(db: DrizzleD1Database<typeof schema>): Promise<Message[]> {
  return await db.select().from(messages).orderBy(desc(messages.createdAt))
}

export async function createMessage(db: DrizzleD1Database<typeof schema>, username: string, content: string) {
  // Throws
  await db.insert(messages).values({ username, content }).returning()
}

// Returns true if message successfully updated
export async function editMessage(db: DrizzleD1Database<typeof schema>, id: string, message: string, username: string): Promise<boolean> {
  const result = await db.update(messages)
    .set({ content: message, createdAt: new Date() })
    .where(and(eq(messages.id, id), eq(messages.username, username)))
    .returning()
  return result.length !== 0
}

// Returns true if message successfully deleted
export async function deleteMessage(db: DrizzleD1Database<typeof schema>, id: string, username: string): Promise<boolean> {
  const result = await db.delete(messages)
    .where(and(eq(messages.id, id), eq(messages.username, username)))
    .returning()
  return result.length !== 0
}
