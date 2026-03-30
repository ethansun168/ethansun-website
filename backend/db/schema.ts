import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  username: text("username", { length: 20 }).notNull().primaryKey(),
  password: text("password", { length: 256 }).notNull(),
  createdAt: integer("created", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user")
})

export const ROLES = users.role.enumValues

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().references(() => users.username, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: integer("created", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
})
