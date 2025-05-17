import { 
  User, InsertUser, Task, InsertTask, Category, InsertCategory, 
  Subtask, InsertSubtask, AiSuggestion, InsertAiSuggestion 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByClerkId(clerkId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  getTasksByCategory(categoryId: number): Promise<Task[]>;
  getTasksByPriority(priority: string, userId: number): Promise<Task[]>;
  getCompletedTasks(userId: number): Promise<Task[]>;
  getActiveTasks(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Subtask operations
  getSubtasks(taskId: number): Promise<Subtask[]>;
  createSubtask(subtask: InsertSubtask): Promise<Subtask>;
  updateSubtask(id: number, subtask: Partial<Subtask>): Promise<Subtask | undefined>;
  deleteSubtask(id: number): Promise<boolean>;
  
  // AI Suggestion operations
  getAiSuggestions(taskId: number): Promise<AiSuggestion[]>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private tasks: Map<number, Task>;
  private subtasks: Map<number, Subtask>;
  private aiSuggestions: Map<number, AiSuggestion>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private taskIdCounter: number;
  private subtaskIdCounter: number;
  private aiSuggestionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.tasks = new Map();
    this.subtasks = new Map();
    this.aiSuggestions = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.taskIdCounter = 1;
    this.subtaskIdCounter = 1;
    this.aiSuggestionIdCounter = 1;
    
    // Initialize with default categories
    this.createCategory({ name: "Work", color: "#10B981" });
    this.createCategory({ name: "Personal", color: "#3B82F6" });
    this.createCategory({ name: "Education", color: "#8B5CF6" });
    this.createCategory({ name: "Health", color: "#F59E0B" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.clerkId === clerkId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    
    // Ensure all fields have proper values
    const safeUser = {
      ...insertUser,
      name: insertUser.name ?? null,
      email: insertUser.email ?? null
    };
    
    const user: User = { ...safeUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }
  
  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasksByCategory(categoryId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.categoryId === categoryId
    );
  }
  
  async getTasksByPriority(priority: string, userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.priority === priority && task.userId === userId
    );
  }
  
  async getCompletedTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.completed && task.userId === userId
    );
  }
  
  async getActiveTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => !task.completed && task.userId === userId
    );
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    
    // Ensure all required fields have values
    const safeTask = {
      ...insertTask,
      description: insertTask.description ?? null,
      categoryId: insertTask.categoryId ?? null,
      priority: insertTask.priority ?? "medium",
      dueDate: insertTask.dueDate ?? null,
      completed: insertTask.completed ?? false
    };
    
    const task: Task = { 
      ...safeTask, 
      id, 
      createdAt: now, 
      updatedAt: now
    };
    
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { 
      ...task, 
      ...taskUpdate, 
      updatedAt: new Date()
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    if (!this.tasks.has(id)) return false;
    
    // Delete associated subtasks
    const subtasksToDelete = Array.from(this.subtasks.values())
      .filter(subtask => subtask.taskId === id);
      
    for (const subtask of subtasksToDelete) {
      this.subtasks.delete(subtask.id);
    }
    
    // Delete associated AI suggestions
    const suggestionsToDelete = Array.from(this.aiSuggestions.values())
      .filter(suggestion => suggestion.taskId === id);
      
    for (const suggestion of suggestionsToDelete) {
      this.aiSuggestions.delete(suggestion.id);
    }
    
    return this.tasks.delete(id);
  }

  // Subtask methods
  async getSubtasks(taskId: number): Promise<Subtask[]> {
    return Array.from(this.subtasks.values()).filter(
      (subtask) => subtask.taskId === taskId
    );
  }
  
  async createSubtask(insertSubtask: InsertSubtask): Promise<Subtask> {
    const id = this.subtaskIdCounter++;
    
    // Ensure completed is defined with a default value
    const safeSubtask = {
      ...insertSubtask,
      completed: insertSubtask.completed ?? false
    };
    
    const subtask: Subtask = { ...safeSubtask, id };
    this.subtasks.set(id, subtask);
    return subtask;
  }
  
  async updateSubtask(id: number, subtaskUpdate: Partial<Subtask>): Promise<Subtask | undefined> {
    const subtask = this.subtasks.get(id);
    if (!subtask) return undefined;
    
    const updatedSubtask: Subtask = { 
      ...subtask, 
      ...subtaskUpdate 
    };
    this.subtasks.set(id, updatedSubtask);
    return updatedSubtask;
  }
  
  async deleteSubtask(id: number): Promise<boolean> {
    return this.subtasks.delete(id);
  }

  // AI Suggestion methods
  async getAiSuggestions(taskId: number): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values()).filter(
      (suggestion) => suggestion.taskId === taskId
    );
  }
  
  async createAiSuggestion(insertSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = this.aiSuggestionIdCounter++;
    const now = new Date();
    
    // Ensure priority has a proper value
    const safeSuggestion = {
      ...insertSuggestion,
      priority: insertSuggestion.priority ?? null
    };
    
    const suggestion: AiSuggestion = { 
      ...safeSuggestion, 
      id, 
      createdAt: now 
    };
    
    this.aiSuggestions.set(id, suggestion);
    return suggestion;
  }
}

export const storage = new MemStorage();
