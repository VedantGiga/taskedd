import { InsertAiSuggestion, Task } from "@shared/schema";

// Hugging Face Inference API for task suggestions
export interface AIService {
  generateTaskSuggestions(task: Task): Promise<InsertAiSuggestion[]>;
  analyzePriority(task: Task): Promise<string>;
}

// Implementation using Hugging Face Inference API
export class HuggingFaceAIService implements AIService {
  private apiKey: string;
  private inferenceEndpoint: string;

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || "";
    this.inferenceEndpoint = "https://api-inference.huggingface.co/models/google/flan-t5-base";
  }

  async generateTaskSuggestions(task: Task): Promise<InsertAiSuggestion[]> {
    try {
      // Build prompt for the AI model
      const prompt = `Based on the following task, suggest improvements and subtasks:
Task title: ${task.title}
Task description: ${task.description || "No description provided"}
Due date: ${task.dueDate ? new Date(task.dueDate).toDateString() : "No due date"}
Priority: ${task.priority}
      
Provide suggestions in bullet points:`;

      // Call Hugging Face API
      const response = await fetch(this.inferenceEndpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }

      const result = await response.json();
      const suggestions = this.parseSuggestions(result[0].generated_text);

      // Return AI suggestions
      return suggestions.map(suggestion => ({
        taskId: task.id,
        suggestion,
        priority: task.priority
      }));
    } catch (error) {
      console.error("AI suggestion generation error:", error);
      // Fallback suggestions if API fails
      return [{
        taskId: task.id,
        suggestion: "Break this task into smaller steps for better management",
        priority: task.priority
      }];
    }
  }

  async analyzePriority(task: Task): Promise<string> {
    try {
      // Build prompt for priority analysis
      const prompt = `Analyze the following task and suggest a priority level (low, medium, or high):
Task title: ${task.title}
Task description: ${task.description || "No description provided"}
Due date: ${task.dueDate ? new Date(task.dueDate).toDateString() : "No due date"}

Reply with only one word: low, medium, or high.`;

      // Call Hugging Face API
      const response = await fetch(this.inferenceEndpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }

      const result = await response.json();
      const priorityText = result[0].generated_text.trim().toLowerCase();

      // Map the result to a valid priority
      if (priorityText.includes("high")) return "high";
      if (priorityText.includes("medium")) return "medium";
      if (priorityText.includes("low")) return "low";

      // Default to medium if unclear
      return "medium";
    } catch (error) {
      console.error("AI priority analysis error:", error);
      return task.priority || "medium";
    }
  }

  private parseSuggestions(text: string): string[] {
    // Parse the bullet points from the generated text
    const suggestions = text
      .split(/\n+/)
      .map(line => line.trim())
      .filter(line => line.startsWith("-") || line.startsWith("•"))
      .map(line => line.replace(/^[-•]\s*/, ""))
      .filter(line => line.length > 0);

    // If no bullet points were found, split by newlines
    if (suggestions.length === 0) {
      return text
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 3); // Take at most 3 suggestions
    }

    return suggestions.slice(0, 3); // Take at most 3 suggestions
  }
}

// Create a singleton instance
export const aiService = new HuggingFaceAIService();
