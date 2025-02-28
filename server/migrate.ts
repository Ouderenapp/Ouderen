import { mongoose } from './db';
import { connectDB } from './db';

async function migrate() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("Connected to MongoDB");

    // Create collections and indexes if needed
    const db = mongoose.connection.db;

    // Example: create reminders collection if it doesn't exist
    const collections = await db.listCollections({ name: 'reminders' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('reminders');
      console.log("Created reminders collection");

      // Create indexes for the reminders collection
      await db.collection('reminders').createIndex({ user_id: 1 });
      await db.collection('reminders').createIndex({ activity_id: 1 });
      console.log("Created indexes for reminders collection");
    }

    // Create sessions collection if needed
    const sessionCollections = await db.listCollections({ name: 'sessions' }).toArray();
    if (sessionCollections.length === 0) {
      await db.createCollection('sessions');
      await db.collection('sessions').createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
      console.log("Created sessions collection with TTL index");
    }

    // Add other collections (users, centers, activities, registrations) here similarly.  Schema definition is needed in a separate file.
    const userCollections = await db.listCollections({ name: 'users' }).toArray();
    if (userCollections.length === 0) {
        await db.createCollection('users');
        console.log("Created users collection");
    }
    const centersCollections = await db.listCollections({ name: 'centers' }).toArray();
    if (centersCollections.length === 0) {
        await db.createCollection('centers');
        console.log("Created centers collection");
    }
    const activitiesCollections = await db.listCollections({ name: 'activities' }).toArray();
    if (activitiesCollections.length === 0) {
        await db.createCollection('activities');
        console.log("Created activities collection");
    }
    const registrationsCollections = await db.listCollections({ name: 'registrations' }).toArray();
    if (registrationsCollections.length === 0) {
        await db.createCollection('registrations');
        console.log("Created registrations collection");
    }


    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

migrate();