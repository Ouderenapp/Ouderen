import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum('role', ['user', 'center_admin']);

// Create schema for updating activities
export const updateActivitySchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  imageUrl: z.string().url(),
  date: z.string()
    .refine(str => !isNaN(Date.parse(str)), {
      message: "Invalid date format",
    }),
  capacity: z.number().int().positive(),
  requiredMaterials: z.string().optional(),
  availableFacilities: z.string().optional(),
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
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  offersCarpooling: boolean("offers_carpooling").notNull().default(false),
  wantsCarpooling: boolean("wants_carpooling").notNull().default(false),
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
  requiredMaterials: text("required_materials"),
  availableFacilities: text("available_facilities"),
  enableWaitlist: boolean("enable_waitlist").notNull().default(true),
  enableCarpooling: boolean("enable_carpooling").notNull().default(true),
});

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
  isWaitlisted: boolean("is_waitlisted").notNull().default(false),
  position: integer("position"),
  needsReminder: boolean("needs_reminder").notNull().default(true),
  offersCarpooling: boolean("offers_carpooling").notNull().default(false),
  carpoolingSeats: integer("carpooling_seats"),
  wantsCarpooling: boolean("wants_carpooling").notNull().default(false),
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
  position: integer("position").notNull(),
  joinDate: timestamp("join_date").notNull().defaultNow(),
});

export const carpoolGroups = pgTable("carpool_groups", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull(),
  driverId: integer("driver_id").notNull(),
  availableSeats: integer("available_seats").notNull(),
  departureLocation: text("departure_location").notNull(),
  departureTime: timestamp("departure_time").notNull(),
});

export const carpoolPassengers = pgTable("carpool_passengers", {
  id: serial("id").primaryKey(),
  carpoolGroupId: integer("carpool_group_id").notNull(),
  passengerId: integer("passenger_id").notNull(),
  pickupLocation: text("pickup_location"),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
  reminderTime: timestamp("reminder_time").notNull(),
  isSent: boolean("is_sent").notNull().default(false),
  message: text("message"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  phone: true,
  village: true,
  neighborhood: true,
  anonymousParticipation: true,
  role: true,
  notificationsEnabled: true,
  offersCarpooling: true,
  wantsCarpooling: true,
});

export const insertCenterSchema = createInsertSchema(centers);
export const insertActivitySchema = createInsertSchema(activities).extend({
  date: z.string().transform((str) => new Date(str)),
});
// The updateActivitySchema is already defined at the top of the file
export const insertRegistrationSchema = createInsertSchema(registrations);
export const insertWaitlistSchema = createInsertSchema(waitlist);
export const insertCarpoolGroupSchema = createInsertSchema(carpoolGroups);
export const insertCarpoolPassengerSchema = createInsertSchema(carpoolPassengers);
export const insertReminderSchema = createInsertSchema(reminders);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCenter = z.infer<typeof insertCenterSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type InsertCarpoolGroup = z.infer<typeof insertCarpoolGroupSchema>;
export type InsertCarpoolPassenger = z.infer<typeof insertCarpoolPassengerSchema>;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

export type User = typeof users.$inferSelect;
export type Center = typeof centers.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
export type Waitlist = typeof waitlist.$inferSelect;
export type CarpoolGroup = typeof carpoolGroups.$inferSelect;
export type CarpoolPassenger = typeof carpoolPassengers.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;