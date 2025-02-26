import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRegistrationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Centers
  app.get("/api/centers", async (_req, res) => {
    const centers = await storage.getCenters();
    res.json(centers);
  });

  app.get("/api/centers/:id", async (req, res) => {
    const center = await storage.getCenter(parseInt(req.params.id));
    if (!center) {
      return res.status(404).json({ message: "Center not found" });
    }
    res.json(center);
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    const centerId = req.query.centerId ? parseInt(req.query.centerId as string) : undefined;
    const activities = await storage.getActivities(centerId);
    res.json(activities);
  });

  app.get("/api/activities/:id", async (req, res) => {
    const activity = await storage.getActivity(parseInt(req.params.id));
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.json(activity);
  });

  // Users
  app.post("/api/users", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    const existingUser = await storage.getUserByUsername(result.data.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await storage.createUser(result.data);
    res.status(201).json(user);
  });

  // Registrations
  app.get("/api/activities/:id/registrations", async (req, res) => {
    const registrations = await storage.getRegistrations(parseInt(req.params.id));
    const users = await Promise.all(
      registrations.map(r => storage.getUser(r.userId))
    );
    res.json(users.filter(u => u !== undefined));
  });

  app.post("/api/activities/:id/register", async (req, res) => {
    const activityId = parseInt(req.params.id);
    const result = insertRegistrationSchema.safeParse({
      userId: req.body.userId,
      activityId
    });

    if (!result.success) {
      return res.status(400).json({ message: "Invalid registration data" });
    }

    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const registrations = await storage.getRegistrations(activityId);
    if (registrations.length >= activity.capacity) {
      return res.status(400).json({ message: "Activity is full" });
    }

    const registration = await storage.createRegistration(result.data);
    res.status(201).json(registration);
  });

  app.delete("/api/activities/:id/register", async (req, res) => {
    const activityId = parseInt(req.params.id);
    const userId = req.body.userId;

    await storage.deleteRegistration(userId, activityId);
    res.status(204).send();
  });

  // New route to get user's activities
  app.get("/api/users/:id/activities", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.id !== parseInt(req.params.id)) {
      return res.status(401).json({ message: "Niet geautoriseerd" });
    }

    const registrations = await storage.getRegistrationsByUser(parseInt(req.params.id));
    const activities = await Promise.all(
      registrations.map(r => storage.getActivity(r.activityId))
    );
    res.json(activities.filter(a => a !== undefined));
  });

  // New route to update user settings
  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.id !== parseInt(req.params.id)) {
      return res.status(401).json({ message: "Niet geautoriseerd" });
    }

    const schema = z.object({
      anonymousParticipation: z.boolean(),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Ongeldige gegevens" });
    }

    const user = await storage.updateUser(parseInt(req.params.id), result.data);
    res.json(user);
  });

  return httpServer;
}