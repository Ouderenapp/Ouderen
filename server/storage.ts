import {
  users, centers, activities, registrations, waitlist, carpoolGroups, carpoolPassengers, reminders,
  type User, type Center, type Activity, type Registration, type Waitlist, type CarpoolGroup, type CarpoolPassenger, type Reminder,
  type InsertUser, type InsertCenter, type InsertActivity, type InsertRegistration, type InsertWaitlist, 
  type InsertCarpoolGroup, type InsertCarpoolPassenger, type InsertReminder
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, lt, asc, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getUsersByNeighborhood(neighborhood: string, village: string): Promise<User[]>;

  // Centers
  getCenters(village?: string): Promise<Center[]>; // Updated to filter by village
  getCenter(id: number): Promise<Center | undefined>;
  createCenter(center: InsertCenter): Promise<Center>;
  updateCenter(id: number, data: Partial<Center>): Promise<Center>;
  getCentersByAdmin(adminId: number): Promise<Center[]>;

  // Activities 
  getActivities(centerId?: number): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, data: Partial<Activity>): Promise<Activity>;
  deleteActivity(id: number): Promise<void>;
  getUpcomingActivities(): Promise<Activity[]>;

  // Registrations
  getRegistrations(activityId: number): Promise<Registration[]>;
  getRegistrationsByUser(userId: number): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  deleteRegistration(userId: number, activityId: number): Promise<void>;
  getRegistration(userId: number, activityId: number): Promise<Registration | undefined>;
  countRegistrations(activityId: number): Promise<number>;

  // Waitlist
  getWaitlistEntries(activityId: number): Promise<Waitlist[]>;
  getWaitlistByUser(userId: number): Promise<Waitlist[]>;
  createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist>;
  deleteWaitlistEntry(userId: number, activityId: number): Promise<void>;
  getNextWaitlistEntry(activityId: number): Promise<Waitlist | undefined>;
  moveFromWaitlistToRegistration(waitlistId: number): Promise<Registration | undefined>;

  // Carpooling
  createCarpoolGroup(group: InsertCarpoolGroup): Promise<CarpoolGroup>;
  getCarpoolGroups(activityId: number): Promise<CarpoolGroup[]>;
  getCarpoolGroupsByDriver(driverId: number): Promise<CarpoolGroup[]>;
  addPassengerToCarpoolGroup(passenger: InsertCarpoolPassenger): Promise<CarpoolPassenger>;
  removePassengerFromCarpoolGroup(passengerId: number, carpoolGroupId: number): Promise<void>;
  getPotentialCarpoolDrivers(activityId: number, neighborhood: string, village: string): Promise<User[]>;
  getPotentialCarpoolPassengers(activityId: number, neighborhood: string, village: string): Promise<User[]>;

  // Reminders
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  getReminders(userId: number): Promise<Reminder[]>;
  getPendingReminders(): Promise<Reminder[]>;
  markReminderAsSent(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async getUsersByNeighborhood(neighborhood: string, village: string): Promise<User[]> {
    try {
      return await db.select().from(users).where(
        and(
          eq(users.neighborhood, neighborhood),
          eq(users.village, village)
        )
      );
    } catch (error) {
      console.error('Error in getUsersByNeighborhood:', error);
      throw error;
    }
  }

  async getCenters(village?: string): Promise<Center[]> {
    try {
      if (village) {
        return await db.select().from(centers).where(eq(centers.village, village));
      }
      return await db.select().from(centers);
    } catch (error) {
      console.error('Error in getCenters:', error);
      throw error;
    }
  }

  async getCenter(id: number): Promise<Center | undefined> {
    try {
      const [center] = await db.select().from(centers).where(eq(centers.id, id));
      return center;
    } catch (error) {
      console.error('Error in getCenter:', error);
      throw error;
    }
  }

  async createCenter(insertCenter: InsertCenter): Promise<Center> {
    try {
      console.log('Creating center with data:', insertCenter);
      const [center] = await db.insert(centers).values(insertCenter).returning();
      console.log('Created center:', center);
      return center;
    } catch (error) {
      console.error('Error in createCenter:', error);
      throw error;
    }
  }

  async updateCenter(id: number, data: Partial<Center>): Promise<Center> {
    try {
      const [center] = await db
        .update(centers)
        .set(data)
        .where(eq(centers.id, id))
        .returning();
      return center;
    } catch (error) {
      console.error('Error in updateCenter:', error);
      throw error;
    }
  }

  async getCentersByAdmin(adminId: number): Promise<Center[]> {
    try {
      console.log('Getting centers for admin:', adminId);
      const results = await db.select().from(centers).where(eq(centers.adminId, adminId));
      console.log('Found centers:', results);
      return results;
    } catch (error) {
      console.error('Error in getCentersByAdmin:', error);
      throw error;
    }
  }

  async getActivities(centerId?: number): Promise<Activity[]> {
    try {
      if (centerId) {
        return await db.select().from(activities).where(eq(activities.centerId, centerId));
      }
      return await db.select().from(activities);
    } catch (error) {
      console.error('Error in getActivities:', error);
      throw error;
    }
  }

  async getUpcomingActivities(): Promise<Activity[]> {
    try {
      const now = new Date();
      return await db.select()
        .from(activities)
        .where(gt(activities.date, now))
        .orderBy(asc(activities.date));
    } catch (error) {
      console.error('Error in getUpcomingActivities:', error);
      throw error;
    }
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    try {
      const [activity] = await db.select().from(activities).where(eq(activities.id, id));
      return activity;
    } catch (error) {
      console.error('Error in getActivity:', error);
      throw error;
    }
  }

  async createActivity(data: InsertActivity): Promise<Activity> {
    // Set default image if none provided
    if (data.imageUrl === "") {
      data.imageUrl = "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
    }

    try {
      const [activity] = await db.insert(activities).values(data).returning();
      return activity;
    } catch (error) {
      console.error('Error in createActivity:', error);
      throw error;
    }
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity> {
    try {
      // Ensure date is a proper Date object if it's included in updates
      const updatesWithFormattedDate = { ...updates };
      
      // Convert string date to proper Date object if present
      if (updates.date && typeof updates.date === 'string') {
        updatesWithFormattedDate.date = new Date(updates.date);
      }

      // Log for debugging
      console.log('Updating activity with data:', updatesWithFormattedDate);

      const result = await db.update(activities).set(updatesWithFormattedDate).where(eq(activities.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error in updateActivity:', error);
      throw error;
    }
  }

  async deleteActivity(id: number): Promise<void> {
    try {
      // Delete related records first
      await db.delete(registrations).where(eq(registrations.activityId, id));
      await db.delete(waitlist).where(eq(waitlist.activityId, id));
      await db.delete(reminders).where(eq(reminders.activityId, id));
      
      // Delete carpool passengers first, then groups
      const carpoolGroupsToDelete = await db.select().from(carpoolGroups).where(eq(carpoolGroups.activityId, id));
      for (const group of carpoolGroupsToDelete) {
        await db.delete(carpoolPassengers).where(eq(carpoolPassengers.carpoolGroupId, group.id));
      }
      await db.delete(carpoolGroups).where(eq(carpoolGroups.activityId, id));
      
      // Finally delete the activity
      await db.delete(activities).where(eq(activities.id, id));
    } catch (error) {
      console.error('Error in deleteActivity:', error);
      throw error;
    }
  }

  async getRegistrations(activityId: number): Promise<Registration[]> {
    try {
      return await db.select().from(registrations)
        .where(and(
          eq(registrations.activityId, activityId),
          eq(registrations.isWaitlisted, false)
        ));
    } catch (error) {
      console.error('Error in getRegistrations:', error);
      throw error;
    }
  }

  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    try {
      return await db.select().from(registrations)
        .where(and(
          eq(registrations.userId, userId),
          eq(registrations.isWaitlisted, false)
        ));
    } catch (error) {
      console.error('Error in getRegistrationsByUser:', error);
      throw error;
    }
  }

  async getRegistration(userId: number, activityId: number): Promise<Registration | undefined> {
    try {
      const [registration] = await db.select().from(registrations).where(
        and(
          eq(registrations.userId, userId),
          eq(registrations.activityId, activityId)
        )
      );
      return registration;
    } catch (error) {
      console.error('Error in getRegistration:', error);
      throw error;
    }
  }

  async countRegistrations(activityId: number): Promise<number> {
    try {
      const registrations = await db.select().from(registrations)
        .where(and(
          eq(registrations.activityId, activityId),
          eq(registrations.isWaitlisted, false)
        ));
      return registrations.length;
    } catch (error) {
      console.error('Error in countRegistrations:', error);
      throw error;
    }
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    try {
      // Set registration date
      const dataWithDate = {
        ...insertRegistration,
        registrationDate: new Date()
      };
      
      const [registration] = await db.insert(registrations).values(dataWithDate).returning();
      
      // Create reminder for the activity
      const activity = await this.getActivity(registration.activityId);
      if (activity && registration.needsReminder) {
        // Set reminder for 24 hours before the activity
        const reminderTime = new Date(activity.date);
        reminderTime.setHours(reminderTime.getHours() - 24);
        
        await this.createReminder({
          userId: registration.userId,
          activityId: registration.activityId,
          reminderTime,
          isSent: false,
          message: `Herinnering: Je bent ingeschreven voor "${activity.name}" morgen om ${activity.date.toLocaleTimeString('nl-NL')}.`
        });
      }
      
      return registration;
    } catch (error) {
      console.error('Error in createRegistration:', error);
      throw error;
    }
  }

  async deleteRegistration(userId: number, activityId: number): Promise<void> {
    try {
      // Delete any reminders first
      await db.delete(reminders).where(
        and(
          eq(reminders.userId, userId),
          eq(reminders.activityId, activityId)
        )
      );
      
      // Delete from carpooling if applicable
      const carpoolGroups = await this.getCarpoolGroups(activityId);
      for (const group of carpoolGroups) {
        if (group.driverId === userId) {
          // If driver cancels, delete the whole group
          await db.delete(carpoolPassengers).where(eq(carpoolPassengers.carpoolGroupId, group.id));
          await db.delete(carpoolGroups).where(eq(carpoolGroups.id, group.id));
        } else {
          // If passenger cancels, just remove them
          await db.delete(carpoolPassengers).where(
            and(
              eq(carpoolPassengers.carpoolGroupId, group.id),
              eq(carpoolPassengers.passengerId, userId)
            )
          );
        }
      }
      
      // Delete the registration
      await db.delete(registrations).where(
        and(
          eq(registrations.userId, userId),
          eq(registrations.activityId, activityId)
        )
      );
      
      // Check if we can move someone from the waitlist
      await this.processWaitlist(activityId);
    } catch (error) {
      console.error('Error in deleteRegistration:', error);
      throw error;
    }
  }

  async getWaitlistEntries(activityId: number): Promise<Waitlist[]> {
    try {
      return await db.select().from(waitlist)
        .where(eq(waitlist.activityId, activityId))
        .orderBy(asc(waitlist.position));
    } catch (error) {
      console.error('Error in getWaitlistEntries:', error);
      throw error;
    }
  }

  async getWaitlistByUser(userId: number): Promise<Waitlist[]> {
    try {
      return await db.select().from(waitlist)
        .where(eq(waitlist.userId, userId))
        .orderBy(asc(waitlist.position));
    } catch (error) {
      console.error('Error in getWaitlistByUser:', error);
      throw error;
    }
  }

  async getNextWaitlistEntry(activityId: number): Promise<Waitlist | undefined> {
    try {
      const entries = await db.select().from(waitlist)
        .where(eq(waitlist.activityId, activityId))
        .orderBy(asc(waitlist.position));
      
      return entries.length > 0 ? entries[0] : undefined;
    } catch (error) {
      console.error('Error in getNextWaitlistEntry:', error);
      throw error;
    }
  }

  async createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist> {
    try {
      // Get next position in waitlist
      const waitlistEntries = await this.getWaitlistEntries(entry.activityId);
      const position = waitlistEntries.length > 0 
        ? Math.max(...waitlistEntries.map(w => w.position)) + 1 
        : 1;
      
      const entryWithPosition = {
        ...entry,
        position,
        joinDate: new Date()
      };
      
      const [waitlistEntry] = await db.insert(waitlist).values(entryWithPosition).returning();
      return waitlistEntry;
    } catch (error) {
      console.error('Error in createWaitlistEntry:', error);
      throw error;
    }
  }

  async deleteWaitlistEntry(userId: number, activityId: number): Promise<void> {
    try {
      await db.delete(waitlist).where(
        and(
          eq(waitlist.userId, userId),
          eq(waitlist.activityId, activityId)
        )
      );
      
      // Reorder remaining waitlist positions
      const remainingEntries = await this.getWaitlistEntries(activityId);
      for (let i = 0; i < remainingEntries.length; i++) {
        await db.update(waitlist)
          .set({ position: i + 1 })
          .where(eq(waitlist.id, remainingEntries[i].id));
      }
    } catch (error) {
      console.error('Error in deleteWaitlistEntry:', error);
      throw error;
    }
  }

  async moveFromWaitlistToRegistration(waitlistId: number): Promise<Registration | undefined> {
    try {
      // Get waitlist entry
      const [entry] = await db.select().from(waitlist).where(eq(waitlist.id, waitlistId));
      if (!entry) return undefined;
      
      // Create registration
      const registration = await this.createRegistration({
        userId: entry.userId,
        activityId: entry.activityId,
        isWaitlisted: false,
        needsReminder: true
      });
      
      // Delete the waitlist entry
      await this.deleteWaitlistEntry(entry.userId, entry.activityId);
      
      return registration;
    } catch (error) {
      console.error('Error in moveFromWaitlistToRegistration:', error);
      throw error;
    }
  }

  async processWaitlist(activityId: number): Promise<void> {
    try {
      const activity = await this.getActivity(activityId);
      if (!activity || !activity.enableWaitlist) return;
      
      const registrationsCount = await this.countRegistrations(activityId);
      
      if (registrationsCount < activity.capacity) {
        // There's room available, move the next person from waitlist
        const nextInLine = await this.getNextWaitlistEntry(activityId);
        if (nextInLine) {
          await this.moveFromWaitlistToRegistration(nextInLine.id);
          
          // Notify the user they've been moved from waitlist
          const user = await this.getUser(nextInLine.userId);
          if (user && user.notificationsEnabled) {
            await this.createReminder({
              userId: user.id,
              activityId,
              reminderTime: new Date(), // Immediate notification
              isSent: false,
              message: `Je bent van de wachtlijst verplaatst naar de deelnemerslijst voor "${activity.name}".`
            });
          }
          
          // Process again in case there's still room
          await this.processWaitlist(activityId);
        }
      }
    } catch (error) {
      console.error('Error in processWaitlist:', error);
      throw error;
    }
  }

  async createCarpoolGroup(group: InsertCarpoolGroup): Promise<CarpoolGroup> {
    try {
      const [carpoolGroup] = await db.insert(carpoolGroups).values(group).returning();
      return carpoolGroup;
    } catch (error) {
      console.error('Error in createCarpoolGroup:', error);
      throw error;
    }
  }

  async getCarpoolGroups(activityId: number): Promise<CarpoolGroup[]> {
    try {
      return await db.select().from(carpoolGroups)
        .where(eq(carpoolGroups.activityId, activityId));
    } catch (error) {
      console.error('Error in getCarpoolGroups:', error);
      throw error;
    }
  }

  async getCarpoolGroupsByDriver(driverId: number): Promise<CarpoolGroup[]> {
    try {
      return await db.select().from(carpoolGroups)
        .where(eq(carpoolGroups.driverId, driverId));
    } catch (error) {
      console.error('Error in getCarpoolGroupsByDriver:', error);
      throw error;
    }
  }

  async addPassengerToCarpoolGroup(passenger: InsertCarpoolPassenger): Promise<CarpoolPassenger> {
    try {
      // First check if there's room in the group
      const [group] = await db.select().from(carpoolGroups)
        .where(eq(carpoolGroups.id, passenger.carpoolGroupId));
      
      if (!group) throw new Error("Carpool group not found");
      
      const passengers = await db.select().from(carpoolPassengers)
        .where(eq(carpoolPassengers.carpoolGroupId, group.id));
      
      if (passengers.length >= group.availableSeats) {
        throw new Error("No seats available in this carpool group");
      }
      
      // Add the passenger
      const [carpoolPassenger] = await db.insert(carpoolPassengers).values(passenger).returning();
      
      // Update available seats
      await db.update(carpoolGroups)
        .set({ availableSeats: group.availableSeats - 1 })
        .where(eq(carpoolGroups.id, group.id));
      
      return carpoolPassenger;
    } catch (error) {
      console.error('Error in addPassengerToCarpoolGroup:', error);
      throw error;
    }
  }

  async removePassengerFromCarpoolGroup(passengerId: number, carpoolGroupId: number): Promise<void> {
    try {
      // First get the group to update seats later
      const [group] = await db.select().from(carpoolGroups)
        .where(eq(carpoolGroups.id, carpoolGroupId));
      
      if (!group) return;
      
      // Remove the passenger
      await db.delete(carpoolPassengers).where(
        and(
          eq(carpoolPassengers.passengerId, passengerId),
          eq(carpoolPassengers.carpoolGroupId, carpoolGroupId)
        )
      );
      
      // Update available seats
      await db.update(carpoolGroups)
        .set({ availableSeats: group.availableSeats + 1 })
        .where(eq(carpoolGroups.id, group.id));
    } catch (error) {
      console.error('Error in removePassengerFromCarpoolGroup:', error);
      throw error;
    }
  }

  async getPotentialCarpoolDrivers(activityId: number, neighborhood: string, village: string): Promise<User[]> {
    try {
      // Get registrations for this activity
      const regs = await db.select().from(registrations)
        .where(eq(registrations.activityId, activityId));
      
      const userIds = regs.map(r => r.userId);
      
      // Find users from the same neighborhood who offer carpooling
      return await db.select().from(users)
        .where(
          and(
            eq(users.offersCarpooling, true),
            eq(users.neighborhood, neighborhood),
            eq(users.village, village)
          )
        );
    } catch (error) {
      console.error('Error in getPotentialCarpoolDrivers:', error);
      throw error;
    }
  }

  async getPotentialCarpoolPassengers(activityId: number, neighborhood: string, village: string): Promise<User[]> {
    try {
      // Get registrations for this activity
      const regs = await db.select().from(registrations)
        .where(eq(registrations.activityId, activityId));
      
      const userIds = regs.map(r => r.userId);
      
      // Find users from the same neighborhood who want carpooling
      return await db.select().from(users)
        .where(
          and(
            eq(users.wantsCarpooling, true),
            eq(users.neighborhood, neighborhood),
            eq(users.village, village)
          )
        );
    } catch (error) {
      console.error('Error in getPotentialCarpoolPassengers:', error);
      throw error;
    }
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    try {
      const [newReminder] = await db.insert(reminders).values(reminder).returning();
      return newReminder;
    } catch (error) {
      console.error('Error in createReminder:', error);
      throw error;
    }
  }

  async getReminders(userId: number): Promise<Reminder[]> {
    try {
      return await db.select().from(reminders)
        .where(eq(reminders.userId, userId))
        .orderBy(desc(reminders.reminderTime));
    } catch (error) {
      console.error('Error in getReminders:', error);
      throw error;
    }
  }

  async getPendingReminders(): Promise<Reminder[]> {
    try {
      const now = new Date();
      return await db.select().from(reminders)
        .where(
          and(
            eq(reminders.isSent, false),
            lt(reminders.reminderTime, now)
          )
        );
    } catch (error) {
      console.error('Error in getPendingReminders:', error);
      throw error;
    }
  }

  async markReminderAsSent(id: number): Promise<void> {
    try {
      await db.update(reminders)
        .set({ isSent: true })
        .where(eq(reminders.id, id));
    } catch (error) {
      console.error('Error in markReminderAsSent:', error);
      throw error;
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();