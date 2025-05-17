import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  clerkId: true,
  name: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id"),
  priority: text("priority").notNull().default("medium"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  userId: true,
  categoryId: true,
  priority: true,
  dueDate: true,
  completed: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const subtasks = pgTable("subtasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  taskId: integer("task_id").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const insertSubtaskSchema = createInsertSchema(subtasks).pick({
  title: true,
  taskId: true,
  completed: true,
});

export type InsertSubtask = z.infer<typeof insertSubtaskSchema>;
export type Subtask = typeof subtasks.$inferSelect;

export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  suggestion: text("suggestion").notNull(),
  priority: text("priority"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).pick({
  taskId: true,
  suggestion: true,
  priority: true,
});

export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
