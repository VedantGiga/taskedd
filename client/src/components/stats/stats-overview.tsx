import { CheckCircle, ClipboardList, Clock, AlertTriangle } from 'lucide-react';
import { StatCard } from './stat-card';
import { useTaskStats } from '@/hooks/use-task';

export function StatsOverview() {
  const { stats, isLoading } = useTaskStats();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white dark:bg-neutral-800 animate-pulse rounded-lg shadow"></div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Tasks" 
        value={stats.totalTasks} 
        icon={<ClipboardList className="h-10 w-10" />} 
      />
      
      <StatCard 
        title="Completed" 
        value={stats.completedTasks} 
        icon={<CheckCircle className="h-10 w-10" />} 
        iconColor="text-green-500" 
      />
      
      <StatCard 
        title="Upcoming" 
        value={stats.upcomingTasks} 
        icon={<Clock className="h-10 w-10" />} 
        iconColor="text-blue-500" 
      />
      
      <StatCard 
        title="High Priority" 
        value={stats.highPriorityTasks} 
        icon={<AlertTriangle className="h-10 w-10" />} 
        iconColor="text-red-500" 
      />
    </div>
  );
}
