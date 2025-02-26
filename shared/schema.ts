import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  phone: text("phone").notNull(),
});

export const centers = pgTable("centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  centerId: integer("center_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  date: timestamp("date").notNull(),
  capacity: integer("capacity").notNull(),
});

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  phone: true,
});

export const insertCenterSchema = createInsertSchema(centers);
export const insertActivitySchema = createInsertSchema(activities);
export const insertRegistrationSchema = createInsertSchema(registrations);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCenter = z.infer<typeof insertCenterSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;

export type User = typeof users.$inferSelect;
export type Center = typeof centers.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
