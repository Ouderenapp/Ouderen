import {
  users, centers, activities, registrations, reminders, waitlist, carpools, carpoolPassengers, payments,
  type User, type Center, type Activity, type Registration, type Reminder, type Waitlist, type Carpool, type CarpoolPassenger, type Payment,
  type InsertUser, type InsertCenter, type InsertActivity, type InsertRegistration, type InsertReminder, type InsertWaitlist,
  type InsertCarpool, type InsertCarpoolPassenger, type InsertPayment
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;

  // Centers
  getCenters(village?: string): Promise<Center[]>;
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

  // Registrations
  getRegistrations(activityId: number): Promise<Registration[]>;
  getRegistrationsByUser(userId: number): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  deleteRegistration(userId: number, activityId: number): Promise<void>;

  // Reminders
  getRemindersByUser(userId: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<void>;
  getUpcomingReminders(userId: number): Promise<Reminder[]>;

  // Waitlist
  getWaitlist(activityId: number): Promise<Waitlist[]>;
  addToWaitlist(waitlistEntry: InsertWaitlist): Promise<Waitlist>;
  removeFromWaitlist(userId: number, activityId: number): Promise<void>;
  getWaitlistPosition(userId: number, activityId: number): Promise<number>;

  // Carpools
  getCarpools(activityId: number): Promise<Carpool[]>;
  createCarpool(carpool: InsertCarpool): Promise<Carpool>;
  updateCarpool(id: number, data: Partial<Carpool>): Promise<Carpool>;
  deleteCarpool(id: number): Promise<void>;

  // Carpool Passengers
  addPassenger(passenger: InsertCarpoolPassenger): Promise<CarpoolPassenger>;
  removePassenger(carpoolId: number, passengerId: number): Promise<void>;
  getCarpoolPassengers(carpoolId: number): Promise<User[]>;

  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(stripePaymentIntentId: string, status: 'completed' | 'failed' | 'refunded'): Promise<void>;
  getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | undefined>;
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
      await db.delete(activities).where(eq(activities.id, id));
    } catch (error) {
      console.error('Error in deleteActivity:', error);
      throw error;
    }
  }

  async getRegistrations(activityId: number): Promise<Registration[]> {
    try {
      return await db.select().from(registrations).where(eq(registrations.activityId, activityId));
    } catch (error) {
      console.error('Error in getRegistrations:', error);
      throw error;
    }
  }

  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    try {
      return await db.select().from(registrations).where(eq(registrations.userId, userId));
    } catch (error) {
      console.error('Error in getRegistrationsByUser:', error);
      throw error;
    }
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    try {
      const [registration] = await db.insert(registrations).values(insertRegistration).returning();
      return registration;
    } catch (error) {
      console.error('Error in createRegistration:', error);
      throw error;
    }
  }

  async deleteRegistration(userId: number, activityId: number): Promise<void> {
    try {
      await db.delete(registrations).where(
        and(
          eq(registrations.userId, userId),
          eq(registrations.activityId, activityId)
        )
      );
    } catch (error) {
      console.error('Error in deleteRegistration:', error);
      throw error;
    }
  }

  async updateUser(id: number, data: { 
    anonymousParticipation?: boolean,
    displayName?: string,
    phone?: string,
    village?: string,
    neighborhood?: string
  }): Promise<User> {
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

  // Reminder methods
  async getRemindersByUser(userId: number): Promise<Reminder[]> {
    try {
      return await db.select().from(reminders).where(eq(reminders.userId, userId));
    } catch (error) {
      console.error('Error in getRemindersByUser:', error);
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

  async updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder> {
    try {
      const [updatedReminder] = await db
        .update(reminders)
        .set(data)
        .where(eq(reminders.id, id))
        .returning();
      return updatedReminder;
    } catch (error) {
      console.error('Error in updateReminder:', error);
      throw error;
    }
  }

  async deleteReminder(id: number): Promise<void> {
    try {
      await db.delete(reminders).where(eq(reminders.id, id));
    } catch (error) {
      console.error('Error in deleteReminder:', error);
      throw error;
    }
  }

  async getUpcomingReminders(userId: number): Promise<Reminder[]> {
    try {
      const now = new Date();
      return await db
        .select()
        .from(reminders)
        .where(
          and(
            eq(reminders.userId, userId),
            eq(reminders.isRead, false)
          )
        );
    } catch (error) {
      console.error('Error in getUpcomingReminders:', error);
      throw error;
    }
  }

  // Waitlist methods
  async getWaitlist(activityId: number): Promise<Waitlist[]> {
    try {
      return await db.select().from(waitlist).where(eq(waitlist.activityId, activityId));
    } catch (error) {
      console.error('Error in getWaitlist:', error);
      throw error;
    }
  }

  async addToWaitlist(waitlistEntry: InsertWaitlist): Promise<Waitlist> {
    try {
      const [entry] = await db.insert(waitlist).values(waitlistEntry).returning();
      return entry;
    } catch (error) {
      console.error('Error in addToWaitlist:', error);
      throw error;
    }
  }

  async removeFromWaitlist(userId: number, activityId: number): Promise<void> {
    try {
      await db.delete(waitlist).where(
        and(
          eq(waitlist.userId, userId),
          eq(waitlist.activityId, activityId)
        )
      );
    } catch (error) {
      console.error('Error in removeFromWaitlist:', error);
      throw error;
    }
  }

  async getWaitlistPosition(userId: number, activityId: number): Promise<number> {
    try {
      const waitlistEntries = await this.getWaitlist(activityId);
      const position = waitlistEntries.findIndex(entry => entry.userId === userId);
      return position === -1 ? -1 : position + 1;
    } catch (error) {
      console.error('Error in getWaitlistPosition:', error);
      throw error;
    }
  }

  // Carpool methods
  async getCarpools(activityId: number): Promise<Carpool[]> {
    try {
      return await db.select().from(carpools).where(eq(carpools.activityId, activityId));
    } catch (error) {
      console.error('Error in getCarpools:', error);
      throw error;
    }
  }

  async createCarpool(carpool: InsertCarpool): Promise<Carpool> {
    try {
      const [newCarpool] = await db.insert(carpools).values(carpool).returning();
      return newCarpool;
    } catch (error) {
      console.error('Error in createCarpool:', error);
      throw error;
    }
  }

  async updateCarpool(id: number, data: Partial<Carpool>): Promise<Carpool> {
    try {
      const [carpool] = await db
        .update(carpools)
        .set(data)
        .where(eq(carpools.id, id))
        .returning();
      return carpool;
    } catch (error) {
      console.error('Error in updateCarpool:', error);
      throw error;
    }
  }

  async deleteCarpool(id: number): Promise<void> {
    try {
      await db.delete(carpools).where(eq(carpools.id, id));
    } catch (error) {
      console.error('Error in deleteCarpool:', error);
      throw error;
    }
  }

  async addPassenger(passenger: InsertCarpoolPassenger): Promise<CarpoolPassenger> {
    try {
      const [newPassenger] = await db.insert(carpoolPassengers).values(passenger).returning();
      return newPassenger;
    } catch (error) {
      console.error('Error in addPassenger:', error);
      throw error;
    }
  }

  async removePassenger(carpoolId: number, passengerId: number): Promise<void> {
    try {
      await db.delete(carpoolPassengers).where(
        and(
          eq(carpoolPassengers.carpoolId, carpoolId),
          eq(carpoolPassengers.passengerId, passengerId)
        )
      );
    } catch (error) {
      console.error('Error in removePassenger:', error);
      throw error;
    }
  }

  async getCarpoolPassengers(carpoolId: number): Promise<User[]> {
    try {
      const passengers = await db.select().from(carpoolPassengers).where(eq(carpoolPassengers.carpoolId, carpoolId));
      const userIds = passengers.map(p => p.passengerId);
      const users = await Promise.all(userIds.map(id => this.getUser(id)));
      return users.filter((user): user is User => user !== undefined);
    } catch (error) {
      console.error('Error in getCarpoolPassengers:', error);
      throw error;
    }
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    try {
      const [newPayment] = await db.insert(payments).values(payment).returning();
      return newPayment;
    } catch (error) {
      console.error('Error in createPayment:', error);
      throw error;
    }
  }

  async updatePaymentStatus(stripePaymentIntentId: string, status: 'completed' | 'failed' | 'refunded'): Promise<void> {
    try {
      await db
        .update(payments)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error);
      throw error;
    }
  }

  async getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | undefined> {
    try {
      const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
      return payment;
    } catch (error) {
      console.error('Error in getPaymentByStripeId:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();