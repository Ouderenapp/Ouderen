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
    try {
      const centerId = req.query.centerId ? parseInt(req.query.centerId as string) : undefined;

      // Als het een buurthuis admin is, alleen activiteiten van eigen buurthuis tonen
      if (req.user?.role === 'center_admin') {
        const center = await storage.getCentersByAdmin(req.user.id);
        if (center.length > 0) {
          const activities = await storage.getActivities(center[0].id);
          return res.json(activities);
        }
        return res.json([]);
      }

      // Voor normale gebruikers, activiteiten van opgegeven buurthuis tonen
      const activities = await storage.getActivities(centerId);
      res.json(activities);
    } catch (error) {
      console.error('Error getting activities:', error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
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
            anonymousParticipation: true,
            offersCarpooling: user.offersCarpooling,
            wantsCarpooling: user.wantsCarpooling
          };
        } else {
          // Anders stuur de volledige gebruikersinfo
          return {
            id: user?.id,
            displayName: user?.displayName,
            village: user?.village,
            neighborhood: user?.neighborhood,
            anonymousParticipation: false,
            offersCarpooling: user.offersCarpooling,
            wantsCarpooling: user.wantsCarpooling
          };
        }
      });

    res.json(filteredUsers);
  });

  app.post("/api/activities/:id/register", async (req, res) => {
    const activityId = parseInt(req.params.id);
    const result = insertRegistrationSchema.safeParse({
      userId: req.body.userId,
      activityId,
      needsReminder: req.body.needsReminder !== false,
      offersCarpooling: req.body.offersCarpooling || false,
      carpoolingSeats: req.body.carpoolingSeats,
      wantsCarpooling: req.body.wantsCarpooling || false,
    });

    if (!result.success) {
      return res.status(400).json({ message: "Ongeldige registratie data" });
    }

    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activiteit niet gevonden" });
    }

    const registrations = await storage.getRegistrations(activityId);
    if (registrations.length >= activity.capacity) {
      // Activity is full - check if waitlist is enabled
      if (activity.enableWaitlist) {
        // Add to waitlist instead
        const waitlistEntry = await storage.createWaitlistEntry({
          userId: req.body.userId,
          activityId,
          position: 0 // This will be set by the createWaitlistEntry method
        });
        
        return res.status(202).json({ 
          message: "Activiteit is vol. Je bent op de wachtlijst geplaatst.",
          waitlistEntry 
        });
      } else {
        return res.status(400).json({ message: "Activiteit is vol en wachtlijst is niet beschikbaar" });
      }
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

  // Waitlist routes
  app.get("/api/activities/:id/waitlist", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const activity = await storage.getActivity(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: "Activiteit niet gevonden" });
      }
      
      if (!activity.enableWaitlist) {
        return res.status(400).json({ message: "Wachtlijst is niet ingeschakeld voor deze activiteit" });
      }
      
      const waitlistEntries = await storage.getWaitlistEntries(activityId);
      
      // Get user info for each entry
      const usersOnWaitlist = await Promise.all(
        waitlistEntries.map(async entry => {
          const user = await storage.getUser(entry.userId);
          
          if (!user) return null;
          
          // Respect anonymity settings
          if (user.anonymousParticipation) {
            return {
              position: entry.position,
              joinDate: entry.joinDate,
              user: {
                id: user.id,
                village: user.village,
                neighborhood: user.neighborhood,
                anonymousParticipation: true
              }
            };
          } else {
            return {
              position: entry.position,
              joinDate: entry.joinDate,
              user: {
                id: user.id,
                displayName: user.displayName,
                village: user.village,
                neighborhood: user.neighborhood,
                anonymousParticipation: false
              }
            };
          }
        })
      );
      
      res.json(usersOnWaitlist.filter(u => u !== null));
    } catch (error) {
      console.error("Error getting waitlist:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het ophalen van de wachtlijst" });
    }
  });
  
  app.post("/api/activities/:id/waitlist", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = req.body.userId;
      
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activiteit niet gevonden" });
      }
      
      if (!activity.enableWaitlist) {
        return res.status(400).json({ message: "Wachtlijst is niet ingeschakeld voor deze activiteit" });
      }
      
      // Check if user is already on the waitlist
      const waitlistEntries = await storage.getWaitlistEntries(activityId);
      const existingEntry = waitlistEntries.find(entry => entry.userId === userId);
      
      if (existingEntry) {
        return res.status(400).json({ message: "Gebruiker staat al op de wachtlijst" });
      }
      
      // Check if user is already registered
      const existingRegistration = await storage.getRegistration(userId, activityId);
      if (existingRegistration) {
        return res.status(400).json({ message: "Gebruiker is al geregistreerd voor deze activiteit" });
      }
      
      const waitlistEntry = await storage.createWaitlistEntry({
        userId,
        activityId,
        position: 0 // Will be set by the storage method
      });
      
      res.status(201).json(waitlistEntry);
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het toevoegen aan de wachtlijst" });
    }
  });
  
  app.delete("/api/activities/:id/waitlist", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = req.body.userId;
      
      await storage.deleteWaitlistEntry(userId, activityId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from waitlist:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het verwijderen van de wachtlijst" });
    }
  });
  
  // Carpooling routes
  app.get("/api/activities/:id/carpool", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activiteit niet gevonden" });
      }
      
      if (!activity.enableCarpooling) {
        return res.status(400).json({ message: "Carpoolen is niet ingeschakeld voor deze activiteit" });
      }
      
      // Get all carpool groups for this activity
      const carpoolGroups = await storage.getCarpoolGroups(activityId);
      
      // Get detailed information for each group
      const groupsWithDetails = await Promise.all(
        carpoolGroups.map(async group => {
          const driver = await storage.getUser(group.driverId);
          
          // Get all passengers
          const passengers = await db.select().from(carpoolPassengers)
            .where(eq(carpoolPassengers.carpoolGroupId, group.id));
          
          const passengersWithDetails = await Promise.all(
            passengers.map(async p => {
              const passengerUser = await storage.getUser(p.passengerId);
              
              if (!passengerUser) return null;
              
              // Respect anonymity settings
              if (passengerUser.anonymousParticipation) {
                return {
                  id: passengerUser.id,
                  village: passengerUser.village,
                  neighborhood: passengerUser.neighborhood,
                  pickupLocation: p.pickupLocation
                };
              } else {
                return {
                  id: passengerUser.id,
                  displayName: passengerUser.displayName,
                  phone: passengerUser.phone,
                  village: passengerUser.village,
                  neighborhood: passengerUser.neighborhood,
                  pickupLocation: p.pickupLocation
                };
              }
            })
          );
          
          return {
            ...group,
            driver: driver ? {
              id: driver.id,
              displayName: driver.anonymousParticipation ? undefined : driver.displayName,
              phone: driver.anonymousParticipation ? undefined : driver.phone,
              village: driver.village,
              neighborhood: driver.neighborhood
            } : null,
            passengers: passengersWithDetails.filter(p => p !== null)
          };
        })
      );
      
      res.json(groupsWithDetails);
    } catch (error) {
      console.error("Error getting carpool groups:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het ophalen van carpool groepen" });
    }
  });
  
  app.post("/api/activities/:id/carpool", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Je moet ingelogd zijn om carpool groepen aan te maken" });
      }
      
      const activityId = parseInt(req.params.id);
      const activity = await storage.getActivity(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: "Activiteit niet gevonden" });
      }
      
      if (!activity.enableCarpooling) {
        return res.status(400).json({ message: "Carpoolen is niet ingeschakeld voor deze activiteit" });
      }
      
      // Check if the user is registered for this activity
      const registration = await storage.getRegistration(req.user.id, activityId);
      if (!registration) {
        return res.status(400).json({ message: "Je moet geregistreerd zijn voor deze activiteit om te kunnen carpoolen" });
      }
      
      // Create a new carpool group
      const carpoolGroup = await storage.createCarpoolGroup({
        activityId,
        driverId: req.user.id,
        availableSeats: req.body.availableSeats || 4,
        departureLocation: req.body.departureLocation || `${req.user.neighborhood}, ${req.user.village}`,
        departureTime: new Date(req.body.departureTime) || activity.date
      });
      
      res.status(201).json(carpoolGroup);
    } catch (error) {
      console.error("Error creating carpool group:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het aanmaken van een carpool groep" });
    }
  });
  
  app.post("/api/carpool/:groupId/join", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Je moet ingelogd zijn om aan te sluiten bij een carpool groep" });
      }
      
      const groupId = parseInt(req.params.groupId);
      const [group] = await db.select().from(carpoolGroups).where(eq(carpoolGroups.id, groupId));
      
      if (!group) {
        return res.status(404).json({ message: "Carpool groep niet gevonden" });
      }
      
      // Check if the user is registered for this activity
      const registration = await storage.getRegistration(req.user.id, group.activityId);
      if (!registration) {
        return res.status(400).json({ message: "Je moet geregistreerd zijn voor deze activiteit om te kunnen carpoolen" });
      }
      
      // Check if there are available seats
      if (group.availableSeats <= 0) {
        return res.status(400).json({ message: "Deze carpool groep is vol" });
      }
      
      // Add user as passenger
      const passenger = await storage.addPassengerToCarpoolGroup({
        carpoolGroupId: groupId,
        passengerId: req.user.id,
        pickupLocation: req.body.pickupLocation || `${req.user.neighborhood}, ${req.user.village}`
      });
      
      res.status(201).json(passenger);
    } catch (error) {
      console.error("Error joining carpool group:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het aansluiten bij een carpool groep" });
    }
  });
  
  app.delete("/api/carpool/:groupId/leave", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Je moet ingelogd zijn om een carpool groep te verlaten" });
      }
      
      const groupId = parseInt(req.params.groupId);
      
      // If user is the driver, delete the whole group
      const [group] = await db.select().from(carpoolGroups).where(eq(carpoolGroups.id, groupId));
      
      if (!group) {
        return res.status(404).json({ message: "Carpool groep niet gevonden" });
      }
      
      if (group.driverId === req.user.id) {
        // Delete all passengers first
        await db.delete(carpoolPassengers).where(eq(carpoolPassengers.carpoolGroupId, groupId));
        // Then delete the group
        await db.delete(carpoolGroups).where(eq(carpoolGroups.id, groupId));
      } else {
        // Just remove the passenger
        await storage.removePassengerFromCarpoolGroup(req.user.id, groupId);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error leaving carpool group:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het verlaten van een carpool groep" });
    }
  });
  
  // Reminders routes
  app.get("/api/users/:id/reminders", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.id)) {
        return res.status(401).json({ message: "Niet geautoriseerd" });
      }
      
      const reminders = await storage.getReminders(req.user.id);
      
      // Add activity details to each reminder
      const remindersWithActivityDetails = await Promise.all(
        reminders.map(async reminder => {
          const activity = await storage.getActivity(reminder.activityId);
          return {
            ...reminder,
            activity: activity ? {
              id: activity.id,
              name: activity.name,
              date: activity.date
            } : null
          };
        })
      );
      
      res.json(remindersWithActivityDetails);
    } catch (error) {
      console.error("Error getting reminders:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het ophalen van herinneringen" });
    }
  });
  
  // Enable/disable reminders
  app.patch("/api/users/:id/notification-settings", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.id)) {
        return res.status(401).json({ message: "Niet geautoriseerd" });
      }
      
      const { notificationsEnabled } = req.body;
      
      if (notificationsEnabled === undefined) {
        return res.status(400).json({ message: "notificationsEnabled veld is vereist" });
      }
      
      const user = await storage.updateUser(req.user.id, { notificationsEnabled });
      res.json(user);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het bijwerken van de meldingsinstellingen" });
    }
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
  
  // Get user's waitlisted activities
  app.get("/api/users/:id/waitlisted", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.id !== parseInt(req.params.id)) {
      return res.status(401).json({ message: "Niet geautoriseerd" });
    }
    
    const waitlistEntries = await storage.getWaitlistByUser(parseInt(req.params.id));
    const activities = await Promise.all(
      waitlistEntries.map(async entry => {
        const activity = await storage.getActivity(entry.activityId);
        if (!activity) return null;
        
        return {
          ...activity,
          waitlistPosition: entry.position,
          joinDate: entry.joinDate
        };
      })
    );
    
    res.json(activities.filter(a => a !== null));
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
        neighborhood,
        notificationsEnabled,
        offersCarpooling,
        wantsCarpooling
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
      
      if (notificationsEnabled !== undefined) {
        updateData.notificationsEnabled = notificationsEnabled;
      }
      
      if (offersCarpooling !== undefined) {
        updateData.offersCarpooling = offersCarpooling;
      }
      
      if (wantsCarpooling !== undefined) {
        updateData.wantsCarpooling = wantsCarpooling;
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