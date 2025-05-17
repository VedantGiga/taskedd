import { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Calendar, Clipboard } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Task } from '@shared/schema';
import { useTasks, useSubtasks } from '@/hooks/use-task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  categories: { id: number; name: string; color: string }[];
}

export function TaskCard({ task, onEdit, categories }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleTaskCompletion } = useTasks();
  const { subtasks, isLoadingSubtasks } = useSubtasks(task.id);
  
  const handleToggleComplete = () => {
    toggleTaskCompletion.mutate({ id: task.id, completed: !task.completed });
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200';
    }
  };
  
  const getCategoryBadge = () => {
    const category = categories.find(c => c.id === task.categoryId);
    if (!category) return null;
    
    return (
      <Badge className="px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        {category.name}
      </Badge>
    );
  };
  
  const formattedDueDate = task.dueDate 
    ? format(new Date(task.dueDate), 'MMM dd, yyyy')
    : 'No due date';
  
  const remainingSubtasks = isLoadingSubtasks
    ? '...'
    : subtasks.filter(s => !s.completed).length;
  
  return (
    <li 
      className={`task-card hover:bg-neutral-50 dark:hover:bg-neutral-750 ${
        task.completed ? 'bg-neutral-100 dark:bg-neutral-800 opacity-60' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
              className="h-4 w-4"
            />
            <label 
              htmlFor={`task-${task.id}`}
              className={`ml-3 text-sm font-medium ${
                task.completed 
                  ? 'line-through text-neutral-500 dark:text-neutral-400' 
                  : 'text-neutral-900 dark:text-white'
              }`}
            >
              {task.title}
            </label>
            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            {getCategoryBadge()}
            <button 
              onClick={() => onEdit(task)}
              className={`edit-task-btn ml-2 text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300 ${isHovered ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}
            >
              <Edit className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
              <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400 dark:text-neutral-500" />
              Due on: {formattedDueDate}
            </p>
          </div>
          <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0 dark:text-neutral-400">
            <Clipboard className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400 dark:text-neutral-500" />
            {remainingSubtasks === 0 
              ? 'No subtasks remaining' 
              : `${remainingSubtasks} subtask${remainingSubtasks === 1 ? '' : 's'} remaining`}
          </div>
        </div>
      </div>
    </li>
  );
}
