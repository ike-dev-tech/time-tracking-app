import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCategorySchema, 
  insertActivitySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const parsedBody = insertUserSchema.parse(req.body);
      
      // Check if nickname already exists
      const existingUser = await storage.getUserByNickname(parsedBody.nickname);
      if (existingUser) {
        return res.status(409).json({ message: "このニックネームは既に使用されています" });
      }
      
      const user = await storage.createUser(parsedBody);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/:nickname", async (req, res) => {
    try {
      // URLエンコードされたニックネームをデコード
      const nickname = decodeURIComponent(req.params.nickname);
      console.log(`Searching for user with nickname: ${nickname}`);
      
      const user = await storage.getUserByNickname(nickname);
      if (!user) {
        console.log(`User not found: ${nickname}`);
        return res.status(404).json({ message: "ユーザーが見つかりませんでした" });
      }
      
      console.log(`User found:`, user);
      res.json(user);
    } catch (error) {
      console.error("Error finding user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // ユーザーIDからユーザー情報を取得するエンドポイントを追加
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "無効なユーザーIDです" });
      }
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "ユーザーが見つかりませんでした" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error finding user by ID:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Category routes
  app.get("/api/users/:userId/categories", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const parsedBody = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(parsedBody);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsedBody = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, parsedBody);
      
      if (!category) {
        return res.status(404).json({ message: "カテゴリーが見つかりませんでした" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(400).json({ message: "このカテゴリーは使用中のため削除できません" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Activity routes
  app.get("/api/users/:userId/activities", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = req.query.date as string || new Date().toISOString().split('T')[0]; // Default to today
      const activities = await storage.getActivities(userId, date);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const parsedBody = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(parsedBody);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  app.put("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsedBody = insertActivitySchema.partial().parse(req.body);
      const activity = await storage.updateActivity(id, parsedBody);
      
      if (!activity) {
        return res.status(404).json({ message: "アクティビティが見つかりませんでした" });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteActivity(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "アクティビティが見つかりませんでした" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Summary routes
  app.get("/api/users/:userId/summary", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = req.query.date as string || new Date().toISOString().split('T')[0]; // Default to today
      const summary = await storage.getActivitySummary(userId, date);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
