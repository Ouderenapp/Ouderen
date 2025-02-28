import mongoose from 'mongoose';
import { log } from './vite';

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable must be set");
}

export async function connectDB() {
  try {
    console.log("Attempting to connect to MongoDB...");
    log("MongoDB connection string is present");

    // Add connection options for better stability
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);

    // Setup mongoose connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
      log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
      log('Mongoose connection error occurred');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
      log('Mongoose disconnected from MongoDB');
    });

    log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    log('Failed to connect to MongoDB');
    process.exit(1);
  }
}

export { mongoose };