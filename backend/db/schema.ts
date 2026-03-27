import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  username: varchar("username", { length: 20 }).notNull().primaryKey(),
  password: varchar("password", { length: 256 }).notNull(),
  created: timestamp("created").defaultNow(),
})
