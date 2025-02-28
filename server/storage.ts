import {
  User, Center, Activity, Registration, Reminder, Waitlist,
  type InsertUser, type InsertCenter, type InsertActivity, type InsertRegistration,
  type InsertReminder, type InsertWaitlist, type Carpool, type CarpoolPassenger,
  type InsertCarpool, type InsertCarpoolPassenger
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: InsertUser): Promise<any>;
  updateUser(id: string, data: Partial<any>): Promise<any>;

  // Centers
  getCenters(village?: string): Promise<any[]>;
  getCenter(id: string): Promise<any>;
  createCenter(center: InsertCenter): Promise<any>;
  updateCenter(id: string, data: Partial<any>): Promise<any>;
  getCentersByAdmin(adminId: string): Promise<any[]>;

  // Activities
  getActivities(centerId?: string): Promise<any[]>;
  getActivity(id: string): Promise<any>;
  createActivity(activity: InsertActivity): Promise<any>;
  updateActivity(id: string, data: Partial<any>): Promise<any>;
  deleteActivity(id: string): Promise<void>;

  // Registrations
  getRegistrations(activityId: string): Promise<any[]>;
  getRegistrationsByUser(userId: string): Promise<any[]>;
  createRegistration(registration: InsertRegistration): Promise<any>;
  deleteRegistration(userId: string, activityId: string): Promise<void>;

  // Reminders
  getRemindersByUser(userId: string): Promise<any[]>;
  createReminder(reminder: any): Promise<any>;
  updateReminder(id: string, data: Partial<any>): Promise<any>;
  deleteReminder(id: string): Promise<void>;
  getUpcomingReminders(userId: string): Promise<any[]>;

  // Waitlist
  getWaitlist(activityId: string): Promise<any[]>;
  addToWaitlist(waitlistEntry: any): Promise<any>;
  removeFromWaitlist(userId: string, activityId: string): Promise<void>;
  getWaitlistPosition(userId: string, activityId: string): Promise<number>;

  // Carpools
  getCarpools(activityId: string): Promise<Carpool[]>;
  createCarpool(carpool: InsertCarpool): Promise<Carpool>;
  updateCarpool(id: string, data: Partial<Carpool>): Promise<Carpool>;
  deleteCarpool(id: string): Promise<void>;

  // Carpool Passengers
  addPassenger(passenger: InsertCarpoolPassenger): Promise<CarpoolPassenger>;
  removePassenger(carpoolId: string, passengerId: string): Promise<void>;
  getCarpoolPassengers(carpoolId: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string) {
    try {
      return await User.findOne({ username });
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser) {
    try {
      const user = new User(insertUser);
      return await user.save();
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<any>) {
    try {
      return await User.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  async getCenters(village?: string) {
    try {
      if (village) {
        return await Center.find({ village });
      }
      return await Center.find();
    } catch (error) {
      console.error('Error in getCenters:', error);
      throw error;
    }
  }

  async getCenter(id: string) {
    try {
      return await Center.findById(id);
    } catch (error) {
      console.error('Error in getCenter:', error);
      throw error;
    }
  }

  async createCenter(insertCenter: InsertCenter) {
    try {
      const center = new Center(insertCenter);
      return await center.save();
    } catch (error) {
      console.error('Error in createCenter:', error);
      throw error;
    }
  }

  async updateCenter(id: string, data: Partial<any>) {
    try {
      return await Center.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.error('Error in updateCenter:', error);
      throw error;
    }
  }

  async getCentersByAdmin(adminId: string) {
    try {
      return await Center.find({ adminId });
    } catch (error) {
      console.error('Error in getCentersByAdmin:', error);
      throw error;
    }
  }

  async getActivities(centerId?: string) {
    try {
      if (centerId) {
        return await Activity.find({ centerId });
      }
      return await Activity.find();
    } catch (error) {
      console.error('Error in getActivities:', error);
      throw error;
    }
  }

  async getActivity(id: string) {
    try {
      return await Activity.findById(id);
    } catch (error) {
      console.error('Error in getActivity:', error);
      throw error;
    }
  }

  async createActivity(data: InsertActivity) {
    try {
      if (!data.imageUrl) {
        data.imageUrl = "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
      }
      const activity = new Activity(data);
      return await activity.save();
    } catch (error) {
      console.error('Error in createActivity:', error);
      throw error;
    }
  }

  async updateActivity(id: string, data: Partial<any>) {
    try {
      return await Activity.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.error('Error in updateActivity:', error);
      throw error;
    }
  }

  async deleteActivity(id: string) {
    try {
      await Activity.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error in deleteActivity:', error);
      throw error;
    }
  }

  async getRegistrations(activityId: string) {
    try {
      return await Registration.find({ activityId });
    } catch (error) {
      console.error('Error in getRegistrations:', error);
      throw error;
    }
  }

  async getRegistrationsByUser(userId: string) {
    try {
      return await Registration.find({ userId });
    } catch (error) {
      console.error('Error in getRegistrationsByUser:', error);
      throw error;
    }
  }

  async createRegistration(insertRegistration: InsertRegistration) {
    try {
      const registration = new Registration(insertRegistration);
      return await registration.save();
    } catch (error) {
      console.error('Error in createRegistration:', error);
      throw error;
    }
  }

  async deleteRegistration(userId: string, activityId: string) {
    try {
      await Registration.findOneAndDelete({ userId, activityId });
    } catch (error) {
      console.error('Error in deleteRegistration:', error);
      throw error;
    }
  }

  async getRemindersByUser(userId: string) {
    try {
      return await Reminder.find({ userId });
    } catch (error) {
      console.error('Error in getRemindersByUser:', error);
      throw error;
    }
  }

  async createReminder(reminder: any) {
    try {
      const newReminder = new Reminder(reminder);
      return await newReminder.save();
    } catch (error) {
      console.error('Error in createReminder:', error);
      throw error;
    }
  }

  async updateReminder(id: string, data: Partial<any>) {
    try {
      return await Reminder.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.error('Error in updateReminder:', error);
      throw error;
    }
  }

  async deleteReminder(id: string) {
    try {
      await Reminder.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error in deleteReminder:', error);
      throw error;
    }
  }

  async getUpcomingReminders(userId: string) {
    try {
      return await Reminder.find({ userId, isRead: false, reminderDate: { $gte: new Date() } });
    } catch (error) {
      console.error('Error in getUpcomingReminders:', error);
      throw error;
    }
  }

  async getWaitlist(activityId: string) {
    try {
      return await Waitlist.find({ activityId }).sort({ registrationDate: 1 });
    } catch (error) {
      console.error('Error in getWaitlist:', error);
      throw error;
    }
  }

  async addToWaitlist(waitlistEntry: any) {
    try {
      const entry = new Waitlist(waitlistEntry);
      return await entry.save();
    } catch (error) {
      console.error('Error in addToWaitlist:', error);
      throw error;
    }
  }

  async removeFromWaitlist(userId: string, activityId: string) {
    try {
      await Waitlist.findOneAndDelete({ userId, activityId });
    } catch (error) {
      console.error('Error in removeFromWaitlist:', error);
      throw error;
    }
  }

  async getWaitlistPosition(userId: string, activityId: string) {
    try {
      const waitlist = await this.getWaitlist(activityId);
      const position = waitlist.findIndex(entry => entry.userId.toString() === userId);
      return position === -1 ? -1 : position + 1;
    } catch (error) {
      console.error('Error in getWaitlistPosition:', error);
      throw error;
    }
  }

  async getCarpools(activityId: string): Promise<Carpool[]> {
    try {
      return await Carpool.find({ activityId });
    } catch (error) {
      console.error('Error in getCarpools:', error);
      throw error;
    }
  }

  async createCarpool(carpool: InsertCarpool): Promise<Carpool> {
    try {
      const newCarpool = new Carpool(carpool);
      return await newCarpool.save();
    } catch (error) {
      console.error('Error in createCarpool:', error);
      throw error;
    }
  }

  async updateCarpool(id: string, data: Partial<Carpool>): Promise<Carpool> {
    try {
      return await Carpool.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.error('Error in updateCarpool:', error);
      throw error;
    }
  }

  async deleteCarpool(id: string): Promise<void> {
    try {
      await Carpool.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error in deleteCarpool:', error);
      throw error;
    }
  }

  async addPassenger(passenger: InsertCarpoolPassenger): Promise<CarpoolPassenger> {
    try {
      const newPassenger = new CarpoolPassenger(passenger);
      return await newPassenger.save();
    } catch (error) {
      console.error('Error in addPassenger:', error);
      throw error;
    }
  }

  async removePassenger(carpoolId: string, passengerId: string): Promise<void> {
    try {
      await CarpoolPassenger.findOneAndDelete({ carpoolId, passengerId });
    } catch (error) {
      console.error('Error in removePassenger:', error);
      throw error;
    }
  }

  async getCarpoolPassengers(carpoolId: string): Promise<User[]> {
    try {
      const passengers = await CarpoolPassenger.find({ carpoolId });
      const userIds = passengers.map(p => p.passengerId);
      const users = await Promise.all(userIds.map(id => this.getUser(id)));
      return users.filter((user): user is User => user !== undefined);
    } catch (error) {
      console.error('Error in getCarpoolPassengers:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();