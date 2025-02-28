
import { db } from "./db";
import { reminders, users, centers, activities, registrations } from "@shared/schema";
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
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_id INTEGER NOT NULL
      );
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

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_id INTEGER NOT NULL,
        registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS carpools (
        id SERIAL PRIMARY KEY,
        activity_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        departure_location TEXT NOT NULL,
        departure_time TIMESTAMP NOT NULL,
        available_seats INTEGER NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS carpool_passengers (
        id SERIAL PRIMARY KEY,
        carpool_id INTEGER NOT NULL,
        passenger_id INTEGER NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_images (
        id SERIAL PRIMARY KEY,
        activity_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Add missing columns to activities table
    await db.execute(sql`
      ALTER TABLE activities 
      ADD COLUMN IF NOT EXISTS materials_needed TEXT,
      ADD COLUMN IF NOT EXISTS facilities_available TEXT;
    `);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the database connection pool
    await db.pool.end();
  }
}

migrate();
