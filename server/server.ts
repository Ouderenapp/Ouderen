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

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, "..", "dist", "public")));

// Routes registreren
registerRoutes(app).then(() => {
  // Catch-all route to serve index.html for client-side routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dist", "public", "index.html"));
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}); 