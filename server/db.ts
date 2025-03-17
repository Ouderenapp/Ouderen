import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Laad .env bestand
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "..", ".env") });

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

// Gebruik hardcoded connection string als fallback
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_hGLq6WZ1cRAb@ep-nameless-leaf-a9z0109h-pooler.gwc.azure.neon.tech/neondb?sslmode=require";

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create the connection pool
export const pool = new Pool({ connectionString: DATABASE_URL });

// Create the drizzle database instance
export const db = drizzle(pool, { schema });