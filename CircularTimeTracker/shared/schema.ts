import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull().unique(),
});

// Activity categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  color: text("color").notNull(),
  description: text("description"),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  startHour: integer("start_hour").notNull(), // 0-23
  endHour: integer("end_hour").notNull(), // 0-23
  notes: text("notes"),
  date: text("date").notNull(), // YYYY-MM-DD format for easy querying
  title: text("title").notNull(), // Activity title
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  nickname: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
  userId: true,
  description: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  categoryId: true,
  startHour: true,
  endHour: true,
  notes: true,
  date: true,
  title: true,
});

// Relations

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  activities: many(activities),
}));

// Category relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id]
  }),
  activities: many(activities),
}));

// Activity relations
export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [activities.categoryId],
    references: [categories.id]
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Frontend types
export type ActivityWithCategory = Activity & {
  category: Category;
};

export type CategoryWithDuration = Category & {
  hours: number;
  percentage: number;
};
