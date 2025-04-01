import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';

// Laad .env bestand
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Laad .env bestand met absolute path
const envPath = path.resolve(__dirname, "..", ".env");
console.log("Loading .env from:", envPath);

// Controleer of het bestand bestaat
if (fs.existsSync(envPath)) {
  console.log("Env file exists");
  const envContent = fs.readFileSync(envPath, 'utf8')
    .replace(/^\uFEFF/, '') // Verwijder BOM
    .trim();
  console.log("Env file contents:", envContent);
  
  // Parse de .env file handmatig
  const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=').map(s => s.trim());
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
  
  // Zet de environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
} else {
  console.log("Env file does not exist!");
}

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
console.log("DATABASE_URL is set:", !!DATABASE_URL);
console.log("All environment variables:", Object.keys(process.env));
console.log("Environment:", process.env.NODE_ENV);
console.log("Platform:", process.platform);

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Connecting to database...");
console.log("Database URL:", DATABASE_URL.replace(/:[^:]*@/, ':****@')); // Log URL zonder wachtwoord

// Create the connection pool with extra logging
let pool: Pool;
try {
  console.log("Creating connection pool...");
  pool = new Pool({ 
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Dit kan nodig zijn voor sommige SSL configuraties
    }
  });

  // Test database connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack
      });
    } else {
      console.log('Database connected successfully');
    }
  });
} catch (error) {
  console.error('Error creating connection pool:', error);
  throw error;
}

// Create the drizzle database instance
export const db = drizzle(pool, { schema });
export { pool };