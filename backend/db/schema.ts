import { pgTable, varchar, timestamp, uuid, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  username: varchar("username", { length: 20 }).notNull().primaryKey(),
  password: varchar("password", { length: 256 }).notNull(),
  created: timestamp("created").defaultNow(),
})

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username").notNull().references(() => users.username, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
})
