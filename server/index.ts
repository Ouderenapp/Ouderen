import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { setupVite, serveStatic, log } from "./vite";
import { initializeEmailService } from "./email";

const app = express();
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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Exporteer een functie voor Vercel serverless deployment
export default async function handler(req: Request, res: Response) {
  // Zorg dat auth is ingesteld
  setupAuth(app);

  // Setup API routes
  await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server error:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // Handle het huidige request
  return app(req, res);
}

// Start server alleen als we in een niet-serverless omgeving zijn
if (process.env.NODE_ENV !== 'vercel') {
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
      server.listen({
        port,
        host: "localhost"
      }, () => {
        console.log(`Server started successfully on http://localhost:${port}`);
        log(`Server started successfully, serving on port ${port}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD

    const port = process.env.PORT || 5000;
    server.listen({
      port,
      host: "0.0.0.0"
    }, () => {
      console.log(`Server started successfully on port ${port}`);
      log(`Server started successfully, serving on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
=======
  })();
}
>>>>>>> parent of 3d21804 (Naam veranderd naar SamenActief en Vercel configuratie verwijderd)
=======
  })();
}
>>>>>>> parent of 3d21804 (Naam veranderd naar SamenActief en Vercel configuratie verwijderd)
=======
  })();
}
>>>>>>> parent of 3d21804 (Naam veranderd naar SamenActief en Vercel configuratie verwijderd)
=======
  })();
}
>>>>>>> parent of 3d21804 (Naam veranderd naar SamenActief en Vercel configuratie verwijderd)
