import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TaskFilterProps {
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

export function TaskFilter({ onFilterChange, activeFilter }: TaskFilterProps) {
  const filters = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Priority", value: "priority" }
  ];
  
  return (
    <div className="flex space-x-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          size="sm"
          variant="ghost"
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            activeFilter === filter.value
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
          }`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
