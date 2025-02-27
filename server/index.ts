import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { setupVite, serveStatic, log } from "./vite";
import { initializeEmailService } from "./email";

const app = express();

// Add global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Exit on uncaught exception
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Configure body parsers - IMPORTANT: Stripe webhook parser must come first
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add health check endpoint
app.get("/health", (req, res) => {
  res.send("ok");
});

// Initialize email service
if (!process.env.SENDGRID_API_KEY) {
  console.warn("Warning: SENDGRID_API_KEY not set. Email notifications will be disabled.");
} else {
  initializeEmailService(process.env.SENDGRID_API_KEY, "w.kastelijn@student.fontys.nl");
  log("Email service initialized");
}

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  try {
    log("Starting server setup...");
    console.log("Server initialization beginning...");

    // Set up authentication before routes
    setupAuth(app);
    log("Authentication setup complete");
    console.log("Authentication configured successfully");

    const server = await registerRoutes(app);
    log("Routes registered successfully");
    console.log("API routes registered and configured");

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Server error:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
      log("Vite setup complete");
      console.log("Development server (Vite) configured");
    } else {
      serveStatic(app);
      log("Static serving setup complete");
    }

    const port = 5000;
    try {
      await new Promise((resolve, reject) => {
        server.listen({
          port,
          host: "0.0.0.0",
        }, () => {
          console.log(`Server started successfully on http://0.0.0.0:${port}`);
          log(`Server started successfully, serving on port ${port}`);
          resolve(true);
        }).on('error', (err) => {
          console.error("Failed to start server:", err);
          reject(err);
        });
      });
    } catch (error) {
      console.error("Critical error starting server:", error);
      process.exit(1);
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();