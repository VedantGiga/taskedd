import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  iconColor?: string;
}

export function StatCard({ title, value, icon, iconColor = "text-neutral-400" }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-10 w-10 ${iconColor}`}>
              {icon}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {title}
            </div>
            <div className="mt-1 text-3xl font-semibold text-neutral-900 dark:text-white">
              {value}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
