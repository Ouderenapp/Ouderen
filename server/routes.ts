import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRegistrationSchema, insertActivitySchema, insertCenterSchema } from "@shared/schema";
import { hashPassword } from "./auth";

// Middleware om te controleren of een gebruiker een center admin is
function isCenterAdmin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated() || req.user?.role !== 'center_admin') {
    return res.status(403).json({ message: "Alleen buurthuis beheerders hebben toegang tot deze functie" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Nieuwe route om het buurthuis van een admin op te halen
  app.get("/api/centers/my-center", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        console.log('User not authenticated');
        return res.status(401).json({ message: "Niet ingelogd" });
      }

      if (req.user?.role !== 'center_admin') {
        console.log('User not center admin:', req.user?.role);
        return res.status(403).json({ message: "Geen beheerder" });
      }

      console.log('Authenticated user:', req.user);
      const centers = await storage.getCentersByAdmin(req.user.id);
      console.log('Found centers:', centers);

      if (centers.length === 0) {
        // Als er geen buurthuis is, maken we er een aan
        const center = await storage.createCenter({
          name: req.user.displayName,
          address: `${req.user.neighborhood}, ${req.user.village}`,
          description: `Buurthuis ${req.user.displayName} in ${req.user.village}`,
          imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          adminId: req.user.id,
          village: req.user.village
        });
        console.log('Created new center:', center);
        return res.json(center);
      }

      res.json(centers[0]); // Een admin heeft maar één buurthuis
    } catch (error) {
      console.error('Error in /api/centers/my-center:', error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
  });

  // Centers
  app.get("/api/centers", async (req, res) => {
    const village = req.user?.village;
    const centers = await storage.getCenters(village);
    res.json(centers);
  });

  app.get("/api/centers/:id", async (req, res) => {
    const center = await storage.getCenter(parseInt(req.params.id));
    if (!center) {
      return res.status(404).json({ message: "Buurthuis niet gevonden" });
    }
    res.json(center);
  });

  // Admin Routes voor Centra
  app.post("/api/centers", isCenterAdmin, async (req, res) => {
    const result = insertCenterSchema.safeParse({
      ...req.body,
      adminId: req.user?.id,
      village: req.user?.village
    });

    if (!result.success) {
      return res.status(400).json({ message: "Ongeldige data voor buurthuis" });
    }

    const center = await storage.createCenter(result.data);
    res.status(201).json(center);
  });

  app.put("/api/centers/:id", isCenterAdmin, async (req, res) => {
    const centerId = parseInt(req.params.id);
    const center = await storage.getCenter(centerId);

    if (!center) {
      return res.status(404).json({ message: "Buurthuis niet gevonden" });
    }

    if (center.adminId !== req.user?.id) {
      return res.status(403).json({ message: "U heeft geen rechten om dit buurthuis te bewerken" });
    }

    const updatedCenter = await storage.updateCenter(centerId, req.body);
    res.json(updatedCenter);
  });

  // Activities 
  app.get("/api/activities", async (req, res) => {
    const centerId = req.query.centerId ? parseInt(req.query.centerId as string) : undefined;
    const activities = await storage.getActivities(centerId);
    res.json(activities);
  });

  app.post("/api/activities", isCenterAdmin, async (req, res) => {
    const result = insertActivitySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Ongeldige activiteit data" });
    }

    // Controleer of het centrum bij deze admin hoort
    const center = await storage.getCenter(result.data.centerId);
    if (!center || center.adminId !== req.user?.id) {
      return res.status(403).json({ message: "U heeft geen rechten om activiteiten toe te voegen aan dit buurthuis" });
    }

    const activity = await storage.createActivity(result.data);
    res.status(201).json(activity);
  });

  app.put("/api/activities/:id", isCenterAdmin, async (req, res) => {
    const activityId = parseInt(req.params.id);
    const activity = await storage.getActivity(activityId);

    if (!activity) {
      return res.status(404).json({ message: "Activiteit niet gevonden" });
    }

    const center = await storage.getCenter(activity.centerId);
    if (!center || center.adminId !== req.user?.id) {
      return res.status(403).json({ message: "U heeft geen rechten om deze activiteit te bewerken" });
    }

    const updatedActivity = await storage.updateActivity(activityId, req.body);
    res.json(updatedActivity);
  });

  app.delete("/api/activities/:id", isCenterAdmin, async (req, res) => {
    const activityId = parseInt(req.params.id);
    const activity = await storage.getActivity(activityId);

    if (!activity) {
      return res.status(404).json({ message: "Activiteit niet gevonden" });
    }

    const center = await storage.getCenter(activity.centerId);
    if (!center || center.adminId !== req.user?.id) {
      return res.status(403).json({ message: "U heeft geen rechten om deze activiteit te verwijderen" });
    }

    await storage.deleteActivity(activityId);
    res.status(204).send();
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

    // Respecteer de anonimiteitsinstellingen van gebruikers
    const filteredUsers = users
      .filter(u => u !== undefined)
      .map(user => {
        if (user?.anonymousParticipation) {
          // Als de gebruiker anoniem wil zijn, stuur alleen dorp en wijk
          return {
            id: user.id,
            village: user.village,
            neighborhood: user.neighborhood,
            anonymousParticipation: true
          };
        } else {
          // Anders stuur de volledige gebruikersinfo
          return {
            id: user?.id,
            displayName: user?.displayName,
            village: user?.village,
            neighborhood: user?.neighborhood,
            anonymousParticipation: false
          };
        }
      });

    res.json(filteredUsers);
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
  app.patch("/api/users/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user?.id !== parseInt(req.params.id)) {
        return res.sendStatus(403);
      }

      // Haal alle velden op die we willen bijwerken
      const {
        anonymousParticipation,
        displayName,
        phone,
        village,
        neighborhood
      } = req.body;

      // Maak een object met alleen de ingevulde velden
      const updateData: any = {};

      if (anonymousParticipation !== undefined) {
        updateData.anonymousParticipation = anonymousParticipation;
      }

      if (displayName) {
        updateData.displayName = displayName;
      }

      if (phone) {
        updateData.phone = phone;
      }

      if (village) {
        updateData.village = village;
      }

      if (neighborhood) {
        updateData.neighborhood = neighborhood;
      }

      const user = await storage.updateUser(parseInt(req.params.id), updateData);

      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  // Update the register route to properly create a center for admin users
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Gebruikersnaam is al in gebruik" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Als dit een buurthuis beheerder is, maak dan ook een buurthuis aan
      if (user.role === 'center_admin') {
        const center = await storage.createCenter({
          name: user.displayName,
          address: `${user.neighborhood}, ${user.village}`,
          description: `Buurthuis ${user.displayName} in ${user.village}`,
          imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          adminId: user.id,
          village: user.village
        });

        console.log('Created center:', center);
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      console.error('Error in register route:', err);
      next(err);
    }
  });

  return httpServer;
}