
import mongoose from 'mongoose';
import { log } from './vite';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable must be set");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable must be set");
}

// Create a postgres client for Drizzle
const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

export { mongoose };
