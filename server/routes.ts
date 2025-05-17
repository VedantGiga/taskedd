import { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import {
  insertCategorySchema,
  insertTaskSchema,
  insertSubtaskSchema,
  insertAiSuggestionSchema,
  User
} from "@shared/schema";

// Helper function to get or create a default user for local development
async function getOrCreateDefaultUser(): Promise<User> {
  try {
    // Try to get existing default user
    let user = await storage.getUserByUsername("default_user");

    // If user doesn't exist, create one
    if (!user) {
      user = await storage.createUser({
        username: "default_user",
        password: "",
        clerkId: "local_development",
        name: "Default User",
        email: "user@example.com"
      });
      console.log("Created default user for local development", user);
    }

    return user;
  } catch (error) {
    console.error("Error in getOrCreateDefaultUser:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Health check endpoint for Render
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Clerk webhook handler for user creation/updates (preserved for compatibility)
  app.post("/api/webhook/clerk", async (req: Request, res: Response) => {
    const event = req.body;

    try {
      if (event.type === "user.created" || event.type === "user.updated") {
        // This is just a stub now since we don't use authentication
        res.status(200).json({ success: true });
      }
    } catch (error) {
      console.error("Clerk webhook error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/user", async (_req: Request, res: Response) => {
    try {
      const user = await getOrCreateDefaultUser();

      // Don't expose password in response
      const { password, ...userWithoutPassword } = user;

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Category routes
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const validation = insertCategorySchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const category = await storage.createCategory(validation.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      // Get default user
      const user = await getOrCreateDefaultUser();

      // Parse query parameters for filtering
      const { completed, priority, categoryId } = req.query;

      let tasks;

      if (completed === "true") {
        tasks = await storage.getCompletedTasks(user.id);
      } else if (completed === "false") {
        tasks = await storage.getActiveTasks(user.id);
      } else if (priority) {
        tasks = await storage.getTasksByPriority(priority as string, user.id);
      } else if (categoryId) {
        tasks = await storage.getTasksByCategory(Number(categoryId));
      } else {
        tasks = await storage.getTasks(user.id);
      }

      res.status(200).json(tasks);
    } catch (error) {
      console.error("Get tasks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.id);
      const task = await storage.getTaskById(taskId);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.status(200).json(task);
    } catch (error) {
      console.error("Get task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      // Get default user
      const user = await getOrCreateDefaultUser();

      // Format data: if dueDate is a string, convert it to a Date object
      const formattedData = {
        ...req.body,
        userId: user.id // Override userId with default user
      };

      // Convert string date to Date object if present
      if (formattedData.dueDate && typeof formattedData.dueDate === 'string') {
        formattedData.dueDate = new Date(formattedData.dueDate);
      }

      // Validate request body
      const validation = insertTaskSchema.safeParse(formattedData);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      // Create task
      const task = await storage.createTask(validation.data);

      // Generate AI suggestions if requested
      if (req.body.generateAiSuggestions) {
        // This is non-blocking, we don't wait for it to complete
        aiService.generateTaskSuggestions(task).then(suggestions => {
          suggestions.forEach(async (suggestion) => {
            await storage.createAiSuggestion(suggestion);
          });
        });

        // Analyze priority
        const suggestedPriority = await aiService.analyzePriority(task);

        // Create a priority suggestion
        if (suggestedPriority !== task.priority) {
          await storage.createAiSuggestion({
            taskId: task.id,
            suggestion: `Consider changing priority to ${suggestedPriority}`,
            priority: suggestedPriority
          });
        }
      }

      res.status(201).json(task);
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.id);
      const task = await storage.getTaskById(taskId);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Ensure user can't change userId
      const { userId, ...updateData } = req.body;

      // Handle date conversion if needed
      if (updateData.dueDate && typeof updateData.dueDate === 'string') {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      // Update task
      const updatedTask = await storage.updateTask(taskId, updateData);

      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.id);
      const task = await storage.getTaskById(taskId);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Delete task
      const success = await storage.deleteTask(taskId);

      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Subtask routes
  app.get("/api/tasks/:taskId/subtasks", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const task = await storage.getTaskById(taskId);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const subtasks = await storage.getSubtasks(taskId);
      res.status(200).json(subtasks);
    } catch (error) {
      console.error("Get subtasks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tasks/:taskId/subtasks", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const task = await storage.getTaskById(taskId);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Validate request body
      const validation = insertSubtaskSchema.safeParse({
        ...req.body,
        taskId // Override taskId with the one from path
      });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      // Create subtask
      const subtask = await storage.createSubtask(validation.data);
      res.status(201).json(subtask);
    } catch (error) {
      console.error("Create subtask error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/subtasks/:id", async (req: Request, res: Response) => {
    try {
      const subtaskId = Number(req.params.id);

      // Validate existence of subtask
      const subtasks = Array.from(await storage.getSubtasks(0)).filter(s => s.id === subtaskId);

      if (subtasks.length === 0) {
        return res.status(404).json({ error: "Subtask not found" });
      }

      // Ensure user can't change taskId
      const { taskId, ...updateData } = req.body;

      // Update subtask
      const updatedSubtask = await storage.updateSubtask(subtaskId, updateData);

      if (!updatedSubtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }

      res.status(200).json(updatedSubtask);
    } catch (error) {
      console.error("Update subtask error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/subtasks/:id", async (req: Request, res: Response) => {
    try {
      const subtaskId = Number(req.params.id);

      // Validate existence of subtask
      const subtasks = Array.from(await storage.getSubtasks(0)).filter(s => s.id === subtaskId);

      if (subtasks.length === 0) {
        return res.status(404).json({ error: "Subtask not found" });
      }

      // Delete subtask
      const success = await storage.deleteSubtask(subtaskId);

      if (!success) {
        return res.status(404).json({ error: "Subtask not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Delete subtask error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI Suggestions routes
  app.get("/api/tasks/:taskId/suggestions", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const task = await storage.getTaskById(taskId);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const suggestions = await storage.getAiSuggestions(taskId);
      res.status(200).json(suggestions);
    } catch (error) {
      console.error("Get AI suggestions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tasks/:taskId/suggestions", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const task = await storage.getTaskById(taskId);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Generate AI suggestions
      const suggestions = await aiService.generateTaskSuggestions(task);

      // Store suggestions
      const storedSuggestions = await Promise.all(
        suggestions.map(suggestion => storage.createAiSuggestion(suggestion))
      );

      // Analyze priority
      const suggestedPriority = await aiService.analyzePriority(task);

      // Create a priority suggestion
      if (suggestedPriority !== task.priority) {
        const prioritySuggestion = await storage.createAiSuggestion({
          taskId: task.id,
          suggestion: `Consider changing priority to ${suggestedPriority}`,
          priority: suggestedPriority
        });

        storedSuggestions.push(prioritySuggestion);
      }

      res.status(201).json(storedSuggestions);
    } catch (error) {
      console.error("Generate AI suggestions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tasks/:taskId/suggestions/apply", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const task = await storage.getTaskById(taskId);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const { suggestionId } = req.body;

      if (!suggestionId) {
        return res.status(400).json({ error: "suggestionId is required" });
      }

      // Get the suggestion
      const suggestions = await storage.getAiSuggestions(taskId);
      const suggestion = suggestions.find(s => s.id === Number(suggestionId));

      if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
      }

      // Apply the suggestion to the task
      const updateData: Record<string, any> = {};

      // If it's a priority suggestion
      if (suggestion.priority) {
        updateData.priority = suggestion.priority;
      }

      // Update the task with suggestion details
      const updatedTask = await storage.updateTask(taskId, updateData);

      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      console.error("Apply AI suggestion error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}