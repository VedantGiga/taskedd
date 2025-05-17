import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { LayoutDashboard, CheckSquare, Clock, Star, Briefcase, User, ChevronLeft, ChevronRight } from "lucide-react";

// Category labels with color
type Category = {
  name: string;
  color: string;
};

const defaultCategories: Category[] = [
  { name: "Work", color: "#10B981" },
  { name: "Personal", color: "#3B82F6" },
  { name: "Education", color: "#8B5CF6" },
  { name: "Health", color: "#F59E0B" },
];

export function Sidebar() {
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(true);

  // Collapse sidebar on mobile
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="lg:hidden fixed bottom-4 right-4 z-20 p-3 rounded-full bg-primary-600 text-white shadow-lg"
      >
        {expanded ? <ChevronLeft /> : <ChevronRight />}
      </button>
      
      {/* Sidebar */}
      <aside 
        className={`${
          expanded ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } fixed lg:static inset-y-0 left-0 z-10 flex flex-col w-64 transform transition-transform duration-200 ease-in-out border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 lg:flex`}
      >
        {/* Logo and brand */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">TaskFlow</h1>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">AI-Powered Task Management</p>
        </div>
        
        {/* Nav links */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            <Link href="/">
              <a 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive("/") 
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </a>
            </Link>
            <Link href="/tasks">
              <a 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive("/tasks") 
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
                }`}
              >
                <CheckSquare className="w-5 h-5 mr-3" />
                All Tasks
              </a>
            </Link>
            <Link href="/upcoming">
              <a 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive("/upcoming") 
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
                }`}
              >
                <Clock className="w-5 h-5 mr-3" />
                Upcoming
              </a>
            </Link>
            <Link href="/important">
              <a 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive("/important") 
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
                }`}
              >
                <Star className="w-5 h-5 mr-3" />
                Important
              </a>
            </Link>
            <Link href="/projects">
              <a 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive("/projects") 
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
                }`}
              >
                <Briefcase className="w-5 h-5 mr-3" />
                Projects
              </a>
            </Link>
          </div>
          
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
              Categories
            </h3>
            <div className="mt-2 space-y-1">
              {defaultCategories.map((category) => (
                <Link href={`/category/${category.name.toLowerCase()}`} key={category.name}>
                  <a className="flex items-center px-3 py-2 text-sm font-medium text-neutral-600 rounded-md group hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white">
                    <span className="w-2 h-2 mr-3 rounded-full" style={{ backgroundColor: category.color }}></span>
                    {category.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </nav>
        
        {/* User profile */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800">
              <User className="w-4 h-4 text-primary-600 dark:text-primary-300" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Default User</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Local Development</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
