import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task, InsertTask, Subtask, InsertSubtask, AiSuggestion } from "@shared/schema";

// Hook for task-related operations
export function useTasks() {
  const queryClient = useQueryClient();

  // Get all tasks
  const getTasks = (filter?: string) => {
    let url = "/api/tasks";
    if (filter) {
      url += `?${filter}`;
    }
    
    return useQuery<Task[]>({
      queryKey: ['/api/tasks', filter],
    });
  };

  // Get a single task by ID
  const getTask = (id: number) => {
    return useQuery<Task>({
      queryKey: ['/api/tasks', id],
      enabled: !!id,
    });
  };

  // Create a new task
  const createTask = useMutation({
    mutationFn: (task: Omit<InsertTask, "userId">) => 
      apiRequest("POST", "/api/tasks", task)
        .then(res => res.json()),
    onSuccess: () => {
      // Invalidate tasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // Update a task
  const updateTask = useMutation({
    mutationFn: ({ id, task }: { id: number; task: Partial<Task> }) => 
      apiRequest("PATCH", `/api/tasks/${id}`, task)
        .then(res => res.json()),
    onSuccess: (_, variables) => {
      // Invalidate specific task and tasks list
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // Delete a task
  const deleteTask = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: (_, id) => {
      // Invalidate tasks list and remove the deleted task from cache
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.removeQueries({ queryKey: ['/api/tasks', id] });
    },
  });

  // Toggle task completion
  const toggleTaskCompletion = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => 
      apiRequest("PATCH", `/api/tasks/${id}`, { completed })
        .then(res => res.json()),
    onSuccess: (_, variables) => {
      // Invalidate specific task and tasks list
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  return {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };
}

// Hook for subtask-related operations
export function useSubtasks(taskId: number) {
  const queryClient = useQueryClient();

  // Get all subtasks for a task
  const getSubtasks = useQuery<Subtask[]>({
    queryKey: ['/api/tasks', taskId, 'subtasks'],
    enabled: !!taskId,
  });

  // Create a new subtask
  const createSubtask = useMutation({
    mutationFn: (subtask: Omit<InsertSubtask, "taskId">) => 
      apiRequest("POST", `/api/tasks/${taskId}/subtasks`, subtask)
        .then(res => res.json()),
    onSuccess: () => {
      // Invalidate subtasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'subtasks'] });
    },
  });

  // Update a subtask
  const updateSubtask = useMutation({
    mutationFn: ({ id, subtask }: { id: number; subtask: Partial<Subtask> }) => 
      apiRequest("PATCH", `/api/subtasks/${id}`, subtask)
        .then(res => res.json()),
    onSuccess: () => {
      // Invalidate subtasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'subtasks'] });
    },
  });

  // Delete a subtask
  const deleteSubtask = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/subtasks/${id}`),
    onSuccess: () => {
      // Invalidate subtasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'subtasks'] });
    },
  });

  // Toggle subtask completion
  const toggleSubtaskCompletion = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => 
      apiRequest("PATCH", `/api/subtasks/${id}`, { completed })
        .then(res => res.json()),
    onSuccess: () => {
      // Invalidate subtasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'subtasks'] });
    },
  });

  return {
    subtasks: getSubtasks.data || [],
    isLoadingSubtasks: getSubtasks.isLoading,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtaskCompletion,
  };
}

// Hook for task statistics
export function useTaskStats() {
  // Get all tasks for statistics
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const upcomingTasks = tasks.filter(task => !task.completed && task.dueDate && new Date(task.dueDate) > new Date()).length;
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed).length;

  return {
    isLoading,
    stats: {
      totalTasks,
      completedTasks,
      upcomingTasks,
      highPriorityTasks
    }
  };
}

// Hook for AI suggestions
export function useAiSuggestions(taskId: number) {
  const queryClient = useQueryClient();

  // Get AI suggestions for a task
  const getSuggestions = useQuery<AiSuggestion[]>({
    queryKey: ['/api/tasks', taskId, 'suggestions'],
    enabled: !!taskId,
  });

  // Generate new AI suggestions
  const generateSuggestions = useMutation({
    mutationFn: () => 
      apiRequest("POST", `/api/tasks/${taskId}/suggestions`)
        .then(res => res.json()),
    onSuccess: () => {
      // Invalidate suggestions query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'suggestions'] });
    },
  });

  // Apply AI suggestions
  const applySuggestions = useMutation({
    mutationFn: () => 
      apiRequest("POST", `/api/tasks/${taskId}/suggestions/apply`)
        .then(res => res.json()),
    onSuccess: () => {
      // Invalidate suggestions and task data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'subtasks'] });
    },
  });

  return {
    suggestions: getSuggestions.data || [],
    isLoadingSuggestions: getSuggestions.isLoading,
    generateSuggestions,
    applySuggestions,
  };
}
