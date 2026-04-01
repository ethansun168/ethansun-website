import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { RoleArray } from "../src/types.js";

export const users = sqliteTable("users", {
  username: text("username", { length: 20 }).notNull().primaryKey(),
  password: text("password", { length: 256 }).notNull(),
  createdAt: integer("created", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  role: text("role", { enum: RoleArray }).notNull().default("user")
})

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().references(() => users.username, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: integer("created", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
})

export const images = sqliteTable("images", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  username: text("username").notNull().references(() => users.username, { onDelete: "cascade" }),
  createdAt: integer("created", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
})
