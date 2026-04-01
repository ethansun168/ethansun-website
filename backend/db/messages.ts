import { and, desc, eq, InferSelectModel } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema.js";
import { messages } from "./schema.js";
type Message = InferSelectModel<typeof messages>

// TODO: make it paginated
export async function getMessages(db: DrizzleD1Database<typeof schema>): Promise<Message[]> {
  return await db.select().from(messages).orderBy(desc(messages.createdAt))
}

export async function createMessage(db: DrizzleD1Database<typeof schema>, username: string, content: string) {
  // Throws
  await db.insert(messages).values({ username, content })
}

// Returns true if message successfully updated
// Message can only be edited by owner
export async function editMessage(db: DrizzleD1Database<typeof schema>, id: string, message: string, username: string): Promise<boolean> {
  const result = await db.update(messages)
    .set({ content: message, createdAt: new Date() })
    .where(and(eq(messages.id, id), eq(messages.username, username)))
    .returning()
  return result.length !== 0
}

// Returns true if message successfully deleted
// Message can only be deleted by owner
export async function deleteMessage(db: DrizzleD1Database<typeof schema>, id: string, username: string): Promise<boolean> {
  const result = await db.delete(messages)
    .where(and(eq(messages.id, id), eq(messages.username, username)))
    .returning()
  return result.length !== 0
}
