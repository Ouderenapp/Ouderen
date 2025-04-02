import express from "express";
import cors from "cors";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

// Laad .env bestand eerst
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", ".env");
console.log("Loading .env from:", envPath);
const result = config({ path: envPath });
console.log("Env loading result:", result);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes registreren
registerRoutes(app).then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}); 