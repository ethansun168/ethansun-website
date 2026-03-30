import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { messages, users } from "./schema.js";
import * as schema from "./schema.js"
import { and, desc, eq, InferSelectModel } from "drizzle-orm";
import { hashPassword } from "../src/auth.js";

type User = InferSelectModel<typeof users>
type Role = InferSelectModel<typeof users>['role']
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

// TODO: pagination
export async function getUsers(db: DrizzleD1Database<typeof schema>): Promise<Omit<User, 'password'>[]> {
  return await db.select({ username: users.username, role: users.role, createdAt: users.createdAt }).from(users);
}

export async function createUser(db: DrizzleD1Database<typeof schema>, username: string, password: string): Promise<Error | null> {
  const hashedPassword = await hashPassword(password)
  try {
    await db.insert(users).values({ username, password: hashedPassword }).returning()
  }
  catch (e) {
    return new Error("Username already exists")
  }
  return null
}

export async function editUserRole(db: DrizzleD1Database<typeof schema>, username: string, role: Role): Promise<boolean> {
  const result = await db.update(users)
    .set({ role })
    .where(eq(users.username, username))
    .returning()

  return result.length !== 0
}

export async function deleteUser(db: DrizzleD1Database<typeof schema>, username: string): Promise<boolean> {
  const result = await db.delete(users)
    .where(eq(users.username, username))
    .returning()

  return result.length !== 0
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
