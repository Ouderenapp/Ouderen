import {
  users, centers, activities, registrations,
  type User, type Center, type Activity, type Registration,
  type InsertUser, type InsertCenter, type InsertActivity, type InsertRegistration
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Centers
  getCenters(): Promise<Center[]>;
  getCenter(id: number): Promise<Center | undefined>;
  createCenter(center: InsertCenter): Promise<Center>;

  // Activities 
  getActivities(centerId?: number): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Registrations
  getRegistrations(activityId: number): Promise<Registration[]>;
  getRegistrationsByUser(userId: number): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  deleteRegistration(userId: number, activityId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCenters(): Promise<Center[]> {
    return await db.select().from(centers);
  }

  async getCenter(id: number): Promise<Center | undefined> {
    const [center] = await db.select().from(centers).where(eq(centers.id, id));
    return center;
  }

  async createCenter(insertCenter: InsertCenter): Promise<Center> {
    const [center] = await db.insert(centers).values(insertCenter).returning();
    return center;
  }

  async getActivities(centerId?: number): Promise<Activity[]> {
    if (centerId) {
      return await db.select().from(activities).where(eq(activities.centerId, centerId));
    }
    return await db.select().from(activities);
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  async getRegistrations(activityId: number): Promise<Registration[]> {
    return await db.select().from(registrations).where(eq(registrations.activityId, activityId));
  }

  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    return await db.select().from(registrations).where(eq(registrations.userId, userId));
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const [registration] = await db.insert(registrations).values(insertRegistration).returning();
    return registration;
  }

  async deleteRegistration(userId: number, activityId: number): Promise<void> {
    await db.delete(registrations).where(
      and(
        eq(registrations.userId, userId),
        eq(registrations.activityId, activityId)
      )
    );
  }
}

export const storage = new DatabaseStorage();