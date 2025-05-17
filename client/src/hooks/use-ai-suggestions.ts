import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task } from "@shared/schema";

// Hook for AI-specific operations
export function useAiSuggestions() {
  // Generate task suggestions using AI
  const generateTaskSuggestions = useMutation({
    mutationFn: (task: Task) => 
      apiRequest("POST", `/api/tasks/${task.id}/suggestions`)
        .then(res => res.json()),
  });

  // Analyze task priority using AI
  const analyzePriority = useMutation({
    mutationFn: (taskData: { title: string; description?: string; dueDate?: Date }) => 
      apiRequest("POST", "/api/ai/analyze-priority", taskData)
        .then(res => res.json()),
  });

  return {
    generateTaskSuggestions,
    analyzePriority,
  };
}
