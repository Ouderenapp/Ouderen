import express from "express";
import cors from "cors";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Laad .env bestand eerst
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", ".env");
console.log("Loading .env from:", envPath);
const result = config({ path: envPath });
console.log("Env loading result:", result);

// Import router na het laden van .env
import { router } from "./routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 