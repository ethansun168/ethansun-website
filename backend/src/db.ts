import sqlite3 from "sqlite3";
import z from 'zod';

const DB_FILE = "var/db.sqlite3";

export const userSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Async function to get a user
export async function getUser(username: string) {
    const db = new sqlite3.Database(DB_FILE, sqlite3.OPEN_READONLY, (err) => {
        if (err) console.error("Failed to open DB:", err.message);
    });
    console.log("Connected to DB");

    // Wrap db.get in a promise for async/await
    const user = await new Promise<any>((resolve, reject) => {
        db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
            if (err) reject(err);
                else resolve(row);
        });
    });

    db.close((err) => {
        if (err) console.error("Failed to close DB:", err.message);
    });

    const parsedUser = userSchema.safeParse(user);
    if (parsedUser.success) {
        return user;
    }
    else {
        return undefined;
    }
}

