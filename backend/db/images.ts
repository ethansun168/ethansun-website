import { and, desc, eq, inArray } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema.js";
import { images } from "./schema.js";

export async function getImages(db: DrizzleD1Database<typeof schema>, keys: string[]) {
  return db.select({ created: images.createdAt, username: images.username, id: images.id, name: images.name }).from(images).where(inArray(images.id, keys)).orderBy(desc(images.createdAt))
}

export async function createImage(db: DrizzleD1Database<typeof schema>, id: string, url: string, name: string, username: string) {
  await db.insert(images).values({ id, url, name, username })
}

// Returns true if message successfully updated
// Message can only be edited by owner
export async function editImage(db: DrizzleD1Database<typeof schema>, id: string, name: string, username: string): Promise<boolean> {
  const result = await db.update(images)
    .set({ name, createdAt: new Date() })
    .where(and(eq(images.id, id), eq(images.username, username)))
    .returning()
  return result.length !== 0
}

export async function deleteImage(db: DrizzleD1Database<typeof schema>, id: string, username: string) {
  const result = await db.delete(images)
    .where(and(eq(images.id, id), eq(images.username, username)))
    .returning()
  return result.length !== 0
}
