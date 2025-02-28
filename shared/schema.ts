
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Define tables for Drizzle ORM
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  displayName: text('display_name').notNull(),
  phone: text('phone').notNull(),
  village: text('village').notNull(),
  neighborhood: text('neighborhood').notNull(),
  anonymousParticipation: integer('anonymous_participation', { mode: 'boolean' }).default(false),
  role: text('role', { enum: ['user', 'center_admin'] }).default('user')
});

export const centers = sqliteTable('centers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  address: text('address').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  adminId: integer('admin_id').notNull().references(() => users.id),
  village: text('village').notNull()
});

export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  centerId: integer('center_id').notNull().references(() => centers.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  date: text('date').notNull(), // Store as ISO string
  capacity: integer('capacity').notNull(),
  materialsNeeded: text('materials_needed'),
  facilitiesAvailable: text('facilities_available')
});

export const registrations = sqliteTable('registrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  activityId: integer('activity_id').notNull().references(() => activities.id)
}, (t) => ({
  userActivityIndex: primaryKey({ columns: [t.userId, t.activityId] })
}));

export const reminders = sqliteTable('reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  activityId: integer('activity_id').notNull().references(() => activities.id),
  reminderDate: text('reminder_date').notNull(), // Store as ISO string
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false)
});

export const waitlist = sqliteTable('waitlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  activityId: integer('activity_id').notNull().references(() => activities.id),
  registrationDate: text('registration_date').default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
  userActivityIndex: primaryKey({ columns: [t.userId, t.activityId] })
}));

export const carpools = sqliteTable('carpools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  driverId: integer('driver_id').notNull().references(() => users.id),
  activityId: integer('activity_id').notNull().references(() => activities.id),
  departureTime: text('departure_time').notNull(),
  departureLocation: text('departure_location').notNull(),
  capacity: integer('capacity').notNull()
});

export const carpoolPassengers = sqliteTable('carpool_passengers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  carpoolId: integer('carpool_id').notNull().references(() => carpools.id),
  passengerId: integer('passenger_id').notNull().references(() => users.id)
}, (t) => ({
  carpoolPassengerIndex: primaryKey({ columns: [t.carpoolId, t.passengerId] })
}));

// Types based on the tables
export type User = typeof users.$inferSelect;
export type Center = typeof centers.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type Waitlist = typeof waitlist.$inferSelect;
export type Carpool = typeof carpools.$inferSelect;
export type CarpoolPassenger = typeof carpoolPassengers.$inferSelect;

// Types for inserts
export type InsertUser = typeof users.$inferInsert;
export type InsertCenter = typeof centers.$inferInsert;
export type InsertActivity = typeof activities.$inferInsert;
export type InsertRegistration = typeof registrations.$inferInsert;
export type InsertReminder = typeof reminders.$inferInsert;
export type InsertWaitlist = typeof waitlist.$inferInsert;
export type InsertCarpool = typeof carpools.$inferInsert;
export type InsertCarpoolPassenger = typeof carpoolPassengers.$inferInsert;

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
  imageUrl: z.string(),
  adminId: z.number(),
  village: z.string()
});

export const insertActivitySchema = z.object({
  centerId: z.number(),
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  date: z.string(),
  capacity: z.number().int().positive(),
  materialsNeeded: z.string().optional(),
  facilitiesAvailable: z.string().optional()
});

export const insertRegistrationSchema = z.object({
  userId: z.number(),
  activityId: z.number()
});
