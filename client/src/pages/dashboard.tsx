import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsOverview } from '@/components/stats/stats-overview';
import { AISuggestionCard } from '@/components/ai/ai-suggestions';
import { TaskList } from '@/components/tasks/task-list';
import { NewTaskModal } from '@/components/tasks/new-task-modal';
import { ModeToggle } from '@/components/ui/mode-toggle';

export default function Dashboard() {
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  
  // Fetch categories
  const { data: categories = [] } = useQuery<{id: number; name: string; color: string}[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Search */}
            <div className="flex-1 flex justify-start px-2">
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
              
              {/* Notifications */}
              <button className="p-1 rounded-full text-neutral-400 hover:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </button>
              
              {/* Add task button */}
              <Button
                className="items-center shadow-sm"
                onClick={() => setIsNewTaskModalOpen(true)}
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50 dark:bg-neutral-900">
        {/* Dashboard Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Your AI-enhanced productivity hub</p>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <StatsOverview />
        
        {/* AI Suggestion Card */}
        <AISuggestionCard />
        
        {/* Tasks Section */}
        <TaskList categories={categories as {id: number; name: string; color: string}[]} />
      </main>
      
      {/* New Task Modal */}
      <NewTaskModal 
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        categories={categories as {id: number; name: string; color: string}[]}
      />
    </div>
  );
}
