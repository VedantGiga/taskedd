import { useState } from 'react';
import { TaskCard } from './task-card';
import { TaskFilter } from './task-filter';
import { EditTaskModal } from './edit-task-modal';
import { useTasks } from '@/hooks/use-task';
import { Task } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskListProps {
  categories: { id: number; name: string; color: string }[];
}

export function TaskList({ categories }: TaskListProps) {
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const queryFilter = filter === 'all' 
    ? '' 
    : filter === 'active' 
      ? 'completed=false' 
      : filter === 'completed' 
        ? 'completed=true' 
        : filter === 'priority' 
          ? 'priority=high' 
          : '';
  
  const { data: tasks, isLoading } = useTasks().getTasks(queryFilter);
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };
  
  const handleCloseEditModal = () => {
    setEditingTask(null);
  };
  
  return (
    <div className="bg-white dark:bg-neutral-800 shadow-sm rounded-lg overflow-hidden">
      {/* Filter tabs */}
      <div className="px-4 py-4 sm:px-6 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700">
        <div>
          <h2 className="text-lg font-medium text-neutral-900 dark:text-white">My Tasks</h2>
        </div>
        <TaskFilter onFilterChange={setFilter} activeFilter={filter} />
      </div>
      
      {/* Task list */}
      {isLoading ? (
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="mt-2 flex justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks && tasks.length > 0 ? (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              categories={categories}
            />
          ))}
        </ul>
      ) : (
        <div className="p-8 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {filter === 'all' 
              ? "You don't have any tasks yet. Create your first task to get started!"
              : filter === 'completed'
                ? "You haven't completed any tasks yet."
                : filter === 'active'
                  ? "You don't have any active tasks."
                  : filter === 'priority'
                    ? "You don't have any high priority tasks."
                    : "No tasks found with the current filter."}
          </p>
        </div>
      )}
      
      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal 
          task={editingTask} 
          categories={categories}
          isOpen={!!editingTask}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
}
