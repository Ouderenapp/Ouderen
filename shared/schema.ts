import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum('role', ['user', 'center_admin']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);

// Create schema for updating activities
export const updateActivitySchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  imageUrl: z.string().url(),
  date: z.string()
    .refine(str => !isNaN(Date.parse(str)), {
      message: "Invalid date format",
    })
    .transform(str => new Date(str)),
  capacity: z.number().int().positive(),
  materialsNeeded: z.string().optional(),
  facilitiesAvailable: z.string().optional(),
  price: z.number().min(0).optional(), // Add price field
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  phone: text("phone").notNull(),
  village: text("village").notNull(),
  neighborhood: text("neighborhood").notNull(),
  anonymousParticipation: boolean("anonymous_participation").notNull().default(false),
  role: roleEnum("role").notNull().default('user'),
});

export const centers = pgTable("centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  adminId: integer("admin_id").notNull(),
  village: text("village").notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  centerId: integer("center_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  date: timestamp("date").notNull(),
  capacity: integer("capacity").notNull(),
  materialsNeeded: text("materials_needed"),
  facilitiesAvailable: text("facilities_available"),
  price: integer("price"), // Add price in cents
});

// Add new payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  status: paymentStatusEnum("status").notNull().default('pending'),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
  paymentId: integer("payment_id"), // Add reference to payment
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
  reminderDate: timestamp("reminder_date").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
});

export const carpools = pgTable("carpools", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull(),
  driverId: integer("driver_id").notNull(),
  departureLocation: text("departure_location").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  availableSeats: integer("available_seats").notNull(),
});

export const carpoolPassengers = pgTable("carpool_passengers", {
  id: serial("id").primaryKey(),
  carpoolId: integer("carpool_id").notNull(),
  passengerId: integer("passenger_id").notNull(),
});

// Insert schemas
export const insertReminderSchema = createInsertSchema(reminders);
export const insertWaitlistSchema = createInsertSchema(waitlist);
export const insertCarpoolSchema = createInsertSchema(carpools);
export const insertCarpoolPassengerSchema = createInsertSchema(carpoolPassengers);
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  phone: true,
  village: true,
  neighborhood: true,
  anonymousParticipation: true,
  role: true,
});
export const insertCenterSchema = createInsertSchema(centers);
export const insertActivitySchema = createInsertSchema(activities).extend({
  date: z.string().transform((str) => new Date(str)),
  price: z.number().min(0).optional(),
});
export const insertRegistrationSchema = createInsertSchema(registrations);
export const insertPaymentSchema = createInsertSchema(payments);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCenter = z.infer<typeof insertCenterSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type InsertCarpool = z.infer<typeof insertCarpoolSchema>;
export type InsertCarpoolPassenger = z.infer<typeof insertCarpoolPassengerSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type User = typeof users.$inferSelect;
export type Center = typeof centers.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type Waitlist = typeof waitlist.$inferSelect;
export type Carpool = typeof carpools.$inferSelect;
export type CarpoolPassenger = typeof carpoolPassengers.$inferSelect;
export type Payment = typeof payments.$inferSelect;