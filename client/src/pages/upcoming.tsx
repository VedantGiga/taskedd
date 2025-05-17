import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { NewTaskModal } from '@/components/tasks/new-task-modal';
import { Badge } from '@/components/ui/badge';
import { Task } from '@shared/schema';
import { useTasks } from '@/hooks/use-task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskCard } from '@/components/tasks/task-card';
import { EditTaskModal } from '@/components/tasks/edit-task-modal';

export default function UpcomingPage() {
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const { data: tasks, isLoading } = useTasks().getTasks('completed=false');
  
  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Group tasks by due date
  const todayTasks: Task[] = [];
  const tomorrowTasks: Task[] = [];
  const weekTasks: Task[] = [];
  const laterTasks: Task[] = [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);
  
  if (tasks) {
    tasks.forEach(task => {
      if (!task.dueDate) {
        return; // Skip tasks without due date
      }
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate.getTime() === today.getTime()) {
        todayTasks.push(task);
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        tomorrowTasks.push(task);
      } else if (isAfter(dueDate, today) && isBefore(dueDate, nextWeek)) {
        weekTasks.push(task);
      } else if (isAfter(dueDate, today)) {
        laterTasks.push(task);
      }
    });
  }
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };
  
  const handleCloseEditModal = () => {
    setEditingTask(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <div className="flex items-center lg:hidden">
                <button 
                  type="button" 
                  className="p-2 text-neutral-500 rounded-md hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
                >
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>
                
                {/* Mobile logo */}
                <div className="ml-2 lg:hidden">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                    <h1 className="ml-2 text-lg font-bold text-primary-600 dark:text-primary-400">TaskFlow</h1>
                  </div>
                </div>
              </div>
              
              {/* Search */}
              <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-start">
                <div className="max-w-lg w-full lg:max-w-xs">
                  <label htmlFor="search" className="sr-only">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                    <input 
                      id="search" 
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white dark:bg-neutral-700 dark:border-neutral-600 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:placeholder-neutral-400 dark:focus:placeholder-neutral-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 sm:text-sm" 
                      placeholder="Search tasks..." 
                      type="search"
                    />
                  </div>
                </div>
              </div>
              
              {/* Right nav items */}
              <div className="flex items-center space-x-4">
                {/* Dark mode toggle */}
                <ModeToggle />
                
                {/* Add task button (mobile) */}
                <button 
                  className="lg:hidden p-1 rounded-full text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800"
                  onClick={() => setIsNewTaskModalOpen(true)}
                >
                  <span className="sr-only">Add new task</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50 dark:bg-neutral-900">
          {/* Page Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Upcoming Tasks</h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Tasks scheduled for the future</p>
            </div>
            <div>
              <Button 
                className="hidden lg:inline-flex items-center shadow-sm"
                onClick={() => setIsNewTaskModalOpen(true)}
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Task
              </Button>
            </div>
          </div>
          
          {/* Tasks Sections */}
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(2)].map((_, j) => (
                        <div key={j} className="p-4 border rounded-md">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Today's Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" /> 
                    Today
                    {todayTasks.length > 0 && (
                      <Badge className="ml-2 bg-blue-500">{todayTasks.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayTasks.length > 0 ? (
                    <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                      {todayTasks.map(task => (
                        <TaskCard 
                          key={task.id}
                          task={task}
                          onEdit={handleEditTask}
                          categories={categories}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-neutral-500 dark:text-neutral-400 text-center py-4">
                      No tasks scheduled for today.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Tomorrow's Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-500" /> 
                    Tomorrow
                    {tomorrowTasks.length > 0 && (
                      <Badge className="ml-2 bg-indigo-500">{tomorrowTasks.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tomorrowTasks.length > 0 ? (
                    <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                      {tomorrowTasks.map(task => (
                        <TaskCard 
                          key={task.id}
                          task={task}
                          onEdit={handleEditTask}
                          categories={categories}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-neutral-500 dark:text-neutral-400 text-center py-4">
                      No tasks scheduled for tomorrow.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* This Week's Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-purple-500" /> 
                    This Week
                    {weekTasks.length > 0 && (
                      <Badge className="ml-2 bg-purple-500">{weekTasks.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weekTasks.length > 0 ? (
                    <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                      {weekTasks.map(task => (
                        <TaskCard 
                          key={task.id}
                          task={task}
                          onEdit={handleEditTask}
                          categories={categories}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-neutral-500 dark:text-neutral-400 text-center py-4">
                      No tasks scheduled for this week.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Later Tasks */}
              {laterTasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-neutral-500" /> 
                      Later
                      <Badge className="ml-2 bg-neutral-500">{laterTasks.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                      {laterTasks.map(task => (
                        <TaskCard 
                          key={task.id}
                          task={task}
                          onEdit={handleEditTask}
                          categories={categories}
                        />
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* New Task Modal */}
      <NewTaskModal 
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        categories={categories}
      />
      
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
