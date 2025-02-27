import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

(async () => {
  // Set up authentication before routes
  setupAuth(app);

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try a range of ports starting from the preferred one
  const tryListen = (portToUse: number) => {
    if (portToUse > 5010) {
      console.error("Couldn't find an available port between 5003 and 5010");
      return;
    }
    
    server.listen({
      port: portToUse,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${portToUse}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${portToUse} is in use, trying ${portToUse + 1}...`);
        tryListen(portToUse + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };
  
  // Start with port 5003
  tryListen(5003);
})();