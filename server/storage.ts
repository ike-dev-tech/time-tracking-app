import {
  users,
  categories,
  activities,
  type User,
  type Category,
  type Activity,
  type InsertUser,
  type InsertCategory,
  type InsertActivity,
  type ActivityWithCategory,
  type CategoryWithDuration,
} from "@shared/schema";
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import memorystore from 'memorystore';
import { pool } from './db';

const MemoryStore = memorystore(session);
const PgStore = connectPgSimple(session);

export interface IStorage {
  // User operations
  getUserByNickname(nickname: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(userId: number): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Activity operations
  getActivities(userId: number, date: string): Promise<ActivityWithCategory[]>;
  getActivityById(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Summary operations
  getActivitySummary(userId: number, date: string): Promise<CategoryWithDuration[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private activities: Map<number, Activity>;
  private userIdCounter: number;
  private categoryIdCounter: number;
  private activityIdCounter: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.activities = new Map();
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.activityIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24時間ごとに期限切れのセッションをクリア
    });
  }

  // User operations
  async getUserByNickname(nickname: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.nickname === nickname
    );
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // 新しいユーザー用のデフォルトカテゴリを作成
    const defaultCategories = [
      { name: "仕事", color: "#4A90E2", description: "業務関連の活動" },
      { name: "睡眠", color: "#9B59B6", description: "睡眠時間" },
      { name: "食事", color: "#FF9500", description: "食事や休憩時間" },
      { name: "運動", color: "#34C759", description: "スポーツや運動" },
      { name: "その他", color: "#95A5A6", description: "その他の活動" },
    ];
    
    for (const cat of defaultCategories) {
      await this.createCategory({
        userId: id,
        name: cat.name,
        color: cat.color,
        description: cat.description,
      });
    }
    
    return user;
  }

  // Category operations
  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      (category) => category.userId === userId
    );
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description || null 
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(
    id: number,
    categoryUpdate: Partial<InsertCategory>
  ): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...categoryUpdate };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // First check if the category is in use
    const inUse = Array.from(this.activities.values()).some(
      (activity) => activity.categoryId === id
    );
    
    if (inUse) {
      return false;
    }
    
    return this.categories.delete(id);
  }

  // Activity operations
  async getActivities(userId: number, date: string): Promise<ActivityWithCategory[]> {
    const userActivities = Array.from(this.activities.values()).filter(
      (activity) => activity.userId === userId && activity.date === date
    );
    
    return Promise.all(
      userActivities.map(async (activity) => {
        const category = await this.getCategoryById(activity.categoryId);
        return {
          ...activity,
          category: category!,
        };
      })
    );
  }

  async getActivityById(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { 
      ...insertActivity, 
      id,
      notes: insertActivity.notes || null 
    };
    this.activities.set(id, activity);
    return activity;
  }

  async updateActivity(
    id: number,
    activityUpdate: Partial<InsertActivity>
  ): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;

    const updatedActivity = { ...activity, ...activityUpdate };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteActivity(id: number): Promise<boolean> {
    return this.activities.delete(id);
  }

  // Summary operations
  async getActivitySummary(userId: number, date: string): Promise<CategoryWithDuration[]> {
    const activities = await this.getActivities(userId, date);
    const categories = await this.getCategories(userId);
    
    // Initialize result with all categories at 0 hours
    const result: Record<number, CategoryWithDuration> = {};
    for (const category of categories) {
      result[category.id] = {
        ...category,
        hours: 0,
        percentage: 0,
      };
    }
    
    // Calculate hours for each category
    let totalHours = 0;
    for (const activity of activities) {
      let hours = activity.endHour - activity.startHour;
      if (hours < 0) hours += 24; // Handle overnight activities
      
      totalHours += hours;
      
      if (result[activity.categoryId]) {
        result[activity.categoryId].hours += hours;
      }
    }
    
    // Calculate percentages
    if (totalHours > 0) {
      for (const categoryId in result) {
        result[categoryId].percentage = Math.round((result[categoryId].hours / 24) * 100);
      }
    }
    
    return Object.values(result);
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // PostgreSQLセッションストアを作成
    this.sessionStore = new PgStore({
      pool,
      createTableIfMissing: true
    });
    console.log("PostgreSQLセッションストアを初期化しました");
  }

  // User operations
  async getUserByNickname(nickname: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.nickname, nickname));
    return result[0];
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // ユーザーを作成
    const [user] = await db.insert(users).values(insertUser).returning();
    
    // デフォルトのカテゴリを作成
    const defaultCategories = [
      { name: "仕事", color: "#4A90E2", description: "業務関連の活動" },
      { name: "睡眠", color: "#9B59B6", description: "睡眠時間" },
      { name: "食事", color: "#FF9500", description: "食事や休憩時間" },
      { name: "運動", color: "#34C759", description: "スポーツや運動" },
      { name: "その他", color: "#95A5A6", description: "その他の活動" },
    ];
    
    for (const cat of defaultCategories) {
      await this.createCategory({
        userId: user.id,
        name: cat.name,
        color: cat.color,
        description: cat.description,
      });
    }
    
    return user;
  }

  // Category operations
  async getCategories(userId: number): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.userId, userId));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values({
      ...insertCategory,
      description: insertCategory.description || null
    }).returning();
    return category;
  }

  async updateCategory(
    id: number,
    categoryUpdate: Partial<InsertCategory>
  ): Promise<Category | undefined> {
    const [updated] = await db.update(categories)
      .set(categoryUpdate)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // カテゴリが使用中かどうかチェック
    const activitiesWithCategory = await db.select().from(activities)
      .where(eq(activities.categoryId, id));
    
    if (activitiesWithCategory.length > 0) {
      return false;
    }
    
    // カテゴリを削除
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  // Activity operations
  async getActivities(userId: number, date: string): Promise<ActivityWithCategory[]> {
    // まずアクティビティを取得
    const userActivities = await db.select().from(activities)
      .where(and(
        eq(activities.userId, userId),
        eq(activities.date, date)
      ));
    
    // カテゴリ情報を取得して結合
    const activitiesWithCategories = await Promise.all(
      userActivities.map(async (activity) => {
        const category = await this.getCategoryById(activity.categoryId);
        return {
          ...activity,
          category: category!,
        };
      })
    );
    
    return activitiesWithCategories;
  }

  async getActivityById(id: number): Promise<Activity | undefined> {
    const result = await db.select().from(activities).where(eq(activities.id, id));
    return result[0];
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values({
      ...insertActivity,
      notes: insertActivity.notes || null
    }).returning();
    return activity;
  }

  async updateActivity(
    id: number,
    activityUpdate: Partial<InsertActivity>
  ): Promise<Activity | undefined> {
    const [updated] = await db.update(activities)
      .set(activityUpdate)
      .where(eq(activities.id, id))
      .returning();
    return updated;
  }

  async deleteActivity(id: number): Promise<boolean> {
    const result = await db.delete(activities).where(eq(activities.id, id)).returning();
    return result.length > 0;
  }

  // Summary operations
  async getActivitySummary(userId: number, date: string): Promise<CategoryWithDuration[]> {
    const activities = await this.getActivities(userId, date);
    const categories = await this.getCategories(userId);
    
    // すべてのカテゴリを0時間で初期化
    const result: Record<number, CategoryWithDuration> = {};
    for (const category of categories) {
      result[category.id] = {
        ...category,
        hours: 0,
        percentage: 0,
      };
    }
    
    // 各カテゴリの時間を計算
    let totalHours = 0;
    for (const activity of activities) {
      let hours = activity.endHour - activity.startHour;
      if (hours < 0) hours += 24; // 夜間の活動を処理
      
      totalHours += hours;
      
      if (result[activity.categoryId]) {
        result[activity.categoryId].hours += hours;
      }
    }
    
    // パーセンテージを計算
    if (totalHours > 0) {
      for (const categoryId in result) {
        result[categoryId].percentage = Math.round((result[categoryId].hours / 24) * 100);
      }
    }
    
    return Object.values(result);
  }
}

// インメモリストレージからデータベースストレージに切り替え
export const storage = new DatabaseStorage();