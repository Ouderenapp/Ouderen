import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRegistrationSchema, insertActivitySchema, insertCenterSchema, type User } from "@shared/schema";
import { hashPassword } from "./auth";
import { sendWelcomeEmail, sendActivityRegistrationEmail } from "./email";
import { createPaymentIntent, handleWebhook } from "./stripe";
import express from "express";

// Middleware om te controleren of een gebruiker een center admin is
function isCenterAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || req.user?.role !== 'center_admin') {
    return res.status(403).json({ message: "Alleen buurthuis beheerders hebben toegang tot deze functie" });
  }
  next();
}

// Add error handling helper
function handleError(error: any, res: Response) {
  console.error('API Error:', error);
  const status = error.status || error.statusCode || 500;
  const message = error.message || "Er is een fout opgetreden";
  res.status(status).json({ message });
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
    const centerId = parseInt(req.params.id);
    if (isNaN(centerId)) {
        return res.status(400).json({message: "Invalid center ID"});
    }
    const center = await storage.getCenter(centerId);
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
    if (isNaN(centerId)) {
        return res.status(400).json({message: "Invalid center ID"});
    }
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
    try {
      const centerId = req.query.centerId ? parseInt(req.query.centerId as string) : undefined;

      // Validate centerId
      if (!centerId || isNaN(centerId)) {
        return res.json([]);
      }

      // Get activities for the specified center
      const activities = await storage.getActivities(centerId);

      // If no activities found, return empty array instead of null
      return res.json(activities || []);
    } catch (error) {
      console.error('Error in /api/activities:', error);
      return res.status(500).json({ 
        message: "Er is een fout opgetreden bij het ophalen van de activiteiten" 
      });
    }
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
    if (isNaN(activityId)) {
        return res.status(400).json({message: "Invalid activity ID"});
    }
    const activity = await storage.getActivity(activityId);

    if (!activity) {
      return res.status(404).json({ message: "Activiteit niet gevonden" });
    }

    const center = await storage.getCenter(activity.centerId);
    if (!center || center.adminId !== req.user?.id) {
      return res.status(403).json({ message: "U heeft geen rechten om deze activiteit te bewerken" });
    }

    // Convert date string to Date object if it exists in the request
    const updateData = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : undefined
    };

    const updatedActivity = await storage.updateActivity(activityId, updateData);
    res.json(updatedActivity);
  });

  app.delete("/api/activities/:id", isCenterAdmin, async (req, res) => {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
        return res.status(400).json({message: "Invalid activity ID"});
    }
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
    const activityId = parseInt(req.params.id);

    if (isNaN(activityId)) {
      return res.status(400).json({ message: "Ongeldige activiteit ID" });
    }

    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.json(activity);
  });

  // Waitlist routes
  app.get("/api/activities/:id/waitlist", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
          return res.status(400).json({message: "Invalid activity ID"});
      }
      const waitlistEntries = await storage.getWaitlist(activityId);
      const users = await Promise.all(
        waitlistEntries.map(entry => storage.getUser(entry.userId))
      );

      // Filter out undefined users and respect anonymity settings
      const filteredUsers = users
        .filter((user): user is User => user !== undefined)
        .map(user => {
          if (user.anonymousParticipation) {
            return {
              id: user.id,
              village: user.village,
              neighborhood: user.neighborhood,
              anonymousParticipation: true,
              position: waitlistEntries.findIndex(e => e.userId === user.id) + 1
            };
          }
          return {
            id: user.id,
            displayName: user.displayName,
            village: user.village,
            neighborhood: user.neighborhood,
            anonymousParticipation: false,
            position: waitlistEntries.findIndex(e => e.userId === user.id) + 1
          };
        });

      res.json(filteredUsers);
    } catch (error) {
      console.error('Error getting waitlist:', error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
  });

  app.post("/api/activities/:id/waitlist", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "U moet eerst inloggen" });
      }

      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
          return res.status(400).json({message: "Invalid activity ID"});
      }
      const userId = req.user!.id;

      // Check if activity exists and is full
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activiteit niet gevonden" });
      }

      const registrations = await storage.getRegistrations(activityId);
      if (registrations.length < activity.capacity) {
        return res.status(400).json({ message: "Er zijn nog plekken beschikbaar" });
      }

      // Check if user is already on waitlist
      const waitlist = await storage.getWaitlist(activityId);
      if (waitlist.some(entry => entry.userId === userId)) {
        return res.status(400).json({ message: "U staat al op de wachtlijst" });
      }

      // Add to waitlist
      const waitlistEntry = await storage.addToWaitlist({
        userId,
        activityId,
        registrationDate: new Date()
      });

      const position = await storage.getWaitlistPosition(userId, activityId);
      res.status(201).json({ ...waitlistEntry, position });
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
  });

  app.delete("/api/activities/:id/waitlist", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "U moet eerst inloggen" });
      }

      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
          return res.status(400).json({message: "Invalid activity ID"});
      }
      const userId = req.user!.id;

      await storage.removeFromWaitlist(userId, activityId);
      res.status(204).send();
    } catch (error) {
      console.error('Error removing from waitlist:', error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
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
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
        return res.status(400).json({message: "Invalid activity ID"});
    }
    const registrations = await storage.getRegistrations(activityId);
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
    if (isNaN(activityId)) {
        return res.status(400).json({message: "Invalid activity ID"});
    }
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

    // Create a reminder for this activity
    const activityDate = new Date(activity.date);
    const dayBeforeActivity = new Date(activityDate);
    dayBeforeActivity.setDate(dayBeforeActivity.getDate() - 1);

    await storage.createReminder({
      userId: req.body.userId,
      activityId,
      reminderDate: dayBeforeActivity,
      title: `Herinnering: ${activity.name}`,
      message: `Morgen begint de activiteit "${activity.name}". Vergeet niet om hierbij aanwezig te zijn!`,
      isRead: false
    });

    // Send confirmation email if email service is configured
    if (process.env.SENDGRID_API_KEY) {
      const user = await storage.getUser(req.body.userId);
      const center = await storage.getCenter(activity.centerId);
      if (user && center) {
        await sendActivityRegistrationEmail(
          user.username,
          user.displayName,
          activity.name,
          new Date(activity.date),
          `${center.name}, ${center.address}`
        );
      }
    }

    res.status(201).json(registration);
  });

  app.delete("/api/activities/:id/register", async (req, res) => {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
        return res.status(400).json({message: "Invalid activity ID"});
    }
    const userId = req.body.userId;

    await storage.deleteRegistration(userId, activityId);

    // Get all reminders for this user and activity
    const userReminders = await storage.getRemindersByUser(userId);
    const activityReminders = userReminders.filter(r => r.activityId === activityId);

    // Delete all reminders for this activity
    for (const reminder of activityReminders) {
      await storage.deleteReminder(reminder.id);
    }

    res.status(204).send();
  });

  // New route to get user's activities
  app.get("/api/users/:id/activities", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        return res.status(400).json({message: "Invalid user ID"});
    }
    if (!req.isAuthenticated() || req.user?.id !== userId) {
      return res.status(401).json({ message: "Niet geautoriseerd" });
    }

    const registrations = await storage.getRegistrationsByUser(userId);
    const activities = await Promise.all(
      registrations.map(r => storage.getActivity(r.activityId))
    );
    res.json(activities.filter(a => a !== undefined));
  });

  // New route to update user settings
  app.patch("/api/users/:id", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
          return res.status(400).json({message: "Invalid user ID"});
      }
      if (!req.isAuthenticated() || req.user?.id !== userId) {
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

      const user = await storage.updateUser(userId, updateData);

      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  // Reminder routes
  app.get("/api/users/:id/reminders", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        return res.status(400).json({message: "Invalid user ID"});
    }
    if (!req.isAuthenticated() || req.user?.id !== userId) {
      return res.status(401).json({ message: "Niet geautoriseerd" });
    }

    const reminders = await storage.getRemindersByUser(userId);
    res.json(reminders);
  });

  app.get("/api/users/:id/upcoming-reminders", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        return res.status(400).json({message: "Invalid user ID"});
    }
    if (!req.isAuthenticated() || req.user?.id !== userId) {
      return res.status(401).json({ message: "Niet geautoriseerd" });
    }

    const reminders = await storage.getUpcomingReminders(userId);
    res.json(reminders);
  });

  app.patch("/api/reminders/:id", async (req, res) => {
    try {
      const reminderId = parseInt(req.params.id);
      if (isNaN(reminderId)) {
          return res.status(400).json({message: "Invalid reminder ID"});
      }
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Niet geautoriseerd" });
      }

      const updated = await storage.updateReminder(reminderId, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating reminder:', error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
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

      // Send welcome email if email service is configured
      if (process.env.SENDGRID_API_KEY) {
        await sendWelcomeEmail(user.username, user.displayName);
      }

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


  // Add payment routes
  app.post("/api/activities/:id/payment", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "U moet eerst inloggen" });
      }

      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Ongeldige activiteit ID" });
      }

      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activiteit niet gevonden" });
      }

      if (!activity.price) {
        return res.status(400).json({ message: "Deze activiteit is gratis" });
      }

      // Create Stripe PaymentIntent
      const paymentIntent = await createPaymentIntent(activity.price, {
        activityId: activity.id.toString(),
        userId: req.user.id.toString()
      });

      // Create payment record
      const payment = await storage.createPayment({
        userId: req.user.id,
        activityId: activity.id,
        amount: activity.price,
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het verwerken van de betaling" });
    }
  });

  // Stripe webhook handler
  app.post("/api/webhook/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      if (!sig) {
        return res.status(400).json({ message: "Geen Stripe signature gevonden" });
      }

      const event = await handleWebhook(sig, req.body);

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          const { activityId, userId } = paymentIntent.metadata;

          // Update payment status
          await storage.updatePaymentStatus(paymentIntent.id, 'completed');

          // Create registration
          await storage.createRegistration({
            userId: parseInt(userId),
            activityId: parseInt(activityId)
          });

          break;
        case 'payment_intent.payment_failed':
          await storage.updatePaymentStatus(event.data.object.id, 'failed');
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  // New route to get all registrations for a center admin
  app.get("/api/activities/registrations", isCenterAdmin, async (req, res) => {
    try {
      // Haal eerst het buurthuis op van de ingelogde admin
      const centers = await storage.getCentersByAdmin(req.user!.id);
      if (centers.length === 0) {
        return res.json([]);
      }

      // Haal alle activiteiten op van dit buurthuis
      const activities = await storage.getActivities(centers[0].id);

      // Haal voor elke activiteit de registraties op
      const allRegistrations = await Promise.all(
        activities.map(activity => storage.getRegistrations(activity.id))
      );

      // Flatten de array van registraties
      const flattenedRegistrations = allRegistrations.flat();

      res.json(flattenedRegistrations);
    } catch (error) {
      console.error('Error getting registrations:', error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
  });

  return httpServer;
}