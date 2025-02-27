import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Starting database migration...");

  try {
    // Create tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        display_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        village TEXT NOT NULL,
        neighborhood TEXT NOT NULL,
        anonymous_participation BOOLEAN NOT NULL DEFAULT false,
        role TEXT NOT NULL DEFAULT 'user'
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS centers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        admin_id INTEGER NOT NULL,
        village TEXT NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        center_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        capacity INTEGER NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE activities 
      ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_id INTEGER NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required',
      ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_id INTEGER NOT NULL,
        reminder_date TIMESTAMP NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false
      );
    `);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    // Close the database connection pool
    await db.pool.end();
  }
}

migrate();