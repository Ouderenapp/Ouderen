import {
  users, centers, activities, registrations,
  type User, type Center, type Activity, type Registration,
  type InsertUser, type InsertCenter, type InsertActivity, type InsertRegistration
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private centers: Map<number, Center>;
  private activities: Map<number, Activity>;
  private registrations: Map<number, Registration>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.centers = new Map();
    this.activities = new Map();
    this.registrations = new Map();
    this.currentIds = { users: 1, centers: 1, activities: 1, registrations: 1 };

    // Add sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add centers
    const sampleCenters: InsertCenter[] = [
      {
        name: "Downtown Community Center",
        address: "123 Main St",
        description: "A welcoming space for all seniors in the heart of downtown",
        imageUrl: "https://images.unsplash.com/photo-1600729123691-f884cefc5cc2"
      },
      {
        name: "Riverside Senior Center",
        address: "456 River Rd",
        description: "Beautiful facility overlooking the river with modern amenities",
        imageUrl: "https://images.unsplash.com/photo-1566822175646-47404f1431d3"
      }
    ];

    sampleCenters.forEach(center => this.createCenter(center));

    // Add activities
    const sampleActivities: InsertActivity[] = [
      {
        centerId: 1,
        name: "Morning Yoga",
        description: "Gentle yoga suitable for all levels",
        imageUrl: "https://images.unsplash.com/photo-1472066719480-ecc7314ed065",
        date: new Date("2024-04-01T09:00:00"),
        capacity: 20
      },
      {
        centerId: 1,
        name: "Art Workshop",
        description: "Express yourself through painting and drawing",
        imageUrl: "https://images.unsplash.com/photo-1598285721150-ba05782126c3",
        date: new Date("2024-04-02T14:00:00"),
        capacity: 15
      }
    ];

    sampleActivities.forEach(activity => this.createActivity(activity));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCenters(): Promise<Center[]> {
    return Array.from(this.centers.values());
  }

  async getCenter(id: number): Promise<Center | undefined> {
    return this.centers.get(id);
  }

  async createCenter(insertCenter: InsertCenter): Promise<Center> {
    const id = this.currentIds.centers++;
    const center = { ...insertCenter, id };
    this.centers.set(id, center);
    return center;
  }

  async getActivities(centerId?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values());
    return centerId ? activities.filter(a => a.centerId === centerId) : activities;
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentIds.activities++;
    const activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }

  async getRegistrations(activityId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      r => r.activityId === activityId
    );
  }

  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      r => r.userId === userId
    );
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = this.currentIds.registrations++;
    const registration = { ...insertRegistration, id };
    this.registrations.set(id, registration);
    return registration;
  }

  async deleteRegistration(userId: number, activityId: number): Promise<void> {
    const registration = Array.from(this.registrations.values()).find(
      r => r.userId === userId && r.activityId === activityId
    );
    if (registration) {
      this.registrations.delete(registration.id);
    }
  }
}

export const storage = new MemStorage();
