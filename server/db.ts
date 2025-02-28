import mongoose from 'mongoose';
import { log } from './vite';

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable must be set");
}

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