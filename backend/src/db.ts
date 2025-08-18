import Database from "better-sqlite3";
import z from 'zod';

const DB_FILE = "var/db.sqlite3";

export const userSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const db = new Database(DB_FILE);
console.log("Connected to DB");

// Async function to get a user
export async function getUser(username: string) {
    const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    const parsed = userSchema.safeParse(row);
    return parsed.success ? parsed.data : undefined;
}
