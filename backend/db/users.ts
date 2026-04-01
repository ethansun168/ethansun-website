import { eq, InferSelectModel } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { hashPassword } from "../src/auth.js";
import * as schema from "./schema.js";
import { users } from "./schema.js";

type User = InferSelectModel<typeof users>
type Role = InferSelectModel<typeof users>['role']

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
    await db.insert(users).values({ username, password: hashedPassword })
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
