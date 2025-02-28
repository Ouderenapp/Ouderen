import mongoose from 'mongoose';
import { z } from 'zod';

// Schema definitions
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  phone: { type: String, required: true },
  village: { type: String, required: true },
  neighborhood: { type: String, required: true },
  anonymousParticipation: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'center_admin'], default: 'user' }
});

const centerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  village: { type: String, required: true }
});

const activitySchema = new mongoose.Schema({
  centerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Center' },
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  date: { type: Date, required: true },
  capacity: { type: Number, required: true },
  materialsNeeded: String,
  facilitiesAvailable: String
});

const registrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  activityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Activity' }
});

const waitlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  activityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Activity' },
  registrationDate: { type: Date, default: Date.now }
});

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  activityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Activity' },
  reminderDate: { type: Date, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
});

// Models
export const User = mongoose.model('User', userSchema);
export const Center = mongoose.model('Center', centerSchema);
export const Activity = mongoose.model('Activity', activitySchema);
export const Registration = mongoose.model('Registration', registrationSchema);
export const Waitlist = mongoose.model('Waitlist', waitlistSchema);
export const Reminder = mongoose.model('Reminder', reminderSchema);

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  displayName: z.string(),
  phone: z.string(),
  village: z.string(),
  neighborhood: z.string(),
  anonymousParticipation: z.boolean().default(false),
  role: z.enum(['user', 'center_admin']).default('user')
});

export const insertCenterSchema = z.object({
  name: z.string(),
  address: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),
  adminId: z.string(),
  village: z.string()
});

export const insertActivitySchema = z.object({
  centerId: z.string(),
  name: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),
  date: z.string().transform(str => new Date(str)),
  capacity: z.number().int().positive(),
  materialsNeeded: z.string().optional(),
  facilitiesAvailable: z.string().optional()
});

export const insertRegistrationSchema = z.object({
  userId: z.string(),
  activityId: z.string()
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCenter = z.infer<typeof insertCenterSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;