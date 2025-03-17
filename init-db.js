import { Pool } from '@neondatabase/serverless';
import fs from 'fs';

// Database connection
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_hGLq6WZ1cRAb@ep-nameless-leaf-a9z0109h-pooler.gwc.azure.neon.tech/neondb?sslmode=require",
});

async function initializeDatabase() {
  console.log("Connecting to database...");
  
  try {
    const client = await pool.connect();
    
    try {
      console.log("Running basic migrations...");
      
      // Create user role enum - first check if it exists
      try {
        await client.query(`CREATE TYPE role AS ENUM ('user', 'center_admin');`);
        console.log("Created role enum");
      } catch (error) {
        if (error.code === '42710') { // duplicate type error
          console.log("Role enum already exists");
        } else {
          throw error;
        }
      }
      
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          display_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          village TEXT NOT NULL,
          neighborhood TEXT NOT NULL,
          anonymous_participation BOOLEAN NOT NULL DEFAULT false,
          role role NOT NULL DEFAULT 'user'
        );
      `);
      console.log("Created users table");
      
      // Create centers table
      await client.query(`
        CREATE TABLE IF NOT EXISTS centers (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT NOT NULL,
          admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          village TEXT NOT NULL
        );
      `);
      console.log("Created centers table");
      
      // Create activities table
      await client.query(`
        CREATE TABLE IF NOT EXISTS activities (
          id SERIAL PRIMARY KEY,
          center_id INTEGER NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT NOT NULL,
          date TIMESTAMP NOT NULL,
          capacity INTEGER NOT NULL,
          materials_needed TEXT,
          facilities_available TEXT
        );
      `);
      console.log("Created activities table");
      
      // Create activity_images table
      await client.query(`
        CREATE TABLE IF NOT EXISTS activity_images (
          id SERIAL PRIMARY KEY,
          activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          "order" INTEGER NOT NULL DEFAULT 0
        );
      `);
      console.log("Created activity_images table");
      
      // Create registrations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS registrations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
          UNIQUE(user_id, activity_id)
        );
      `);
      console.log("Created registrations table");
      
      // Create waitlist table
      await client.query(`
        CREATE TABLE IF NOT EXISTS waitlist (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
          registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, activity_id)
        );
      `);
      console.log("Created waitlist table");
      
      // Create reminders table
      await client.query(`
        CREATE TABLE IF NOT EXISTS reminders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
          reminder_date TIMESTAMP NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT false
        );
      `);
      console.log("Created reminders table");
      
      // Create carpools table
      await client.query(`
        CREATE TABLE IF NOT EXISTS carpools (
          id SERIAL PRIMARY KEY,
          activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
          driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          departure_location TEXT NOT NULL,
          departure_time TIMESTAMP NOT NULL,
          available_seats INTEGER NOT NULL
        );
      `);
      console.log("Created carpools table");
      
      // Create carpool_passengers table
      await client.query(`
        CREATE TABLE IF NOT EXISTS carpool_passengers (
          id SERIAL PRIMARY KEY,
          carpool_id INTEGER NOT NULL REFERENCES carpools(id) ON DELETE CASCADE,
          passenger_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(carpool_id, passenger_id)
        );
      `);
      console.log("Created carpool_passengers table");

      console.log("Adding sample data...");
      
      // Add sample users
      await client.query(`
        INSERT INTO users (username, password, display_name, phone, village, neighborhood, anonymous_participation, role)
        VALUES 
          ('admin@example.com', 'password', 'Beheerder', '0612345678', 'Eindhoven', 'Centrum', false, 'center_admin'),
          ('jan@example.com', 'password', 'Jan de Vries', '0612345679', 'Eindhoven', 'Woensel', false, 'user'),
          ('maria@example.com', 'password', 'Maria Jansen', '0612345680', 'Eindhoven', 'Stratum', true, 'user'),
          ('piet@example.com', 'password', 'Piet Klaassen', '0612345681', 'Eindhoven', 'Tongelre', false, 'user'),
          ('truus@example.com', 'password', 'Truus Smit', '0612345682', 'Eindhoven', 'Gestel', false, 'user')
        ON CONFLICT (username) DO NOTHING;
      `);
      console.log("Added sample users");
      
      // Add sample centers
      await client.query(`
        INSERT INTO centers (name, address, description, image_url, admin_id, village)
        VALUES 
          ('Buurthuis De Ronde', 'Rondweg 10, Eindhoven', 'Een gezellig buurthuis in het centrum van Eindhoven.', 'https://placehold.co/600x400?text=Buurthuis+De+Ronde', 1, 'Eindhoven'),
          ('Wijkcentrum Oost', 'Ooststraat 22, Eindhoven', 'Modern wijkcentrum voor de bewoners van Eindhoven Oost.', 'https://placehold.co/600x400?text=Wijkcentrum+Oost', 1, 'Eindhoven')
        ON CONFLICT DO NOTHING;
      `);
      console.log("Added sample centers");
      
      // Add sample activities
      await client.query(`
        INSERT INTO activities (center_id, name, description, image_url, date, capacity, materials_needed, facilities_available)
        VALUES 
          (1, 'Bingo-middag', 'Gezellige bingo-middag met leuke prijzen.', 'https://placehold.co/600x400?text=Bingo+Middag', NOW() + INTERVAL '7 days', 20, 'Geen materialen nodig', 'Koffie en thee beschikbaar'),
          (1, 'Handwerkcafé', 'Samen breien, haken of borduren.', 'https://placehold.co/600x400?text=Handwerkcafe', NOW() + INTERVAL '14 days', 15, 'Breng je eigen handwerk mee', 'Koffie, thee en koekjes aanwezig'),
          (2, 'Computercursus', 'Leer omgaan met e-mail en internet.', 'https://placehold.co/600x400?text=Computercursus', NOW() + INTERVAL '10 days', 10, 'Laptop indien mogelijk', 'WiFi en laptops beschikbaar'),
          (2, 'Samen Koken', 'Kook en eet samen met buurtgenoten.', 'https://placehold.co/600x400?text=Samen+Koken', NOW() + INTERVAL '21 days', 12, 'Schort', 'Volledig uitgeruste keuken')
        ON CONFLICT DO NOTHING;
      `);
      console.log("Added sample activities");
      
      // Create indexes for better performance
      await client.query(`CREATE INDEX IF NOT EXISTS idx_registrations_activity ON registrations(activity_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_waitlist_activity ON waitlist(activity_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_activities_center ON activities(center_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_carpools_activity ON carpools(activity_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_reminders_activity ON reminders(activity_id);`);
      console.log("Created indexes");
      
      console.log("Database initialized successfully!");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeDatabase(); 