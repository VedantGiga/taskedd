import { useState } from 'react';
import { CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { useAiSuggestions } from '@/hooks/use-task';
import { Button } from '@/components/ui/button';
import { Task } from '@shared/schema';

interface AISuggestionCardProps {
  task?: Task;
}

export function AISuggestionCard({ task }: AISuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const { 
    suggestions, 
    isLoadingSuggestions, 
    generateSuggestions, 
    applySuggestions 
  } = task ? useAiSuggestions(task.id) : { 
    suggestions: [], 
    isLoadingSuggestions: false, 
    generateSuggestions: { mutate: () => {} },
    applySuggestions: { mutate: () => {} }
  };
  
  const isGenerating = generateSuggestions.isPending;
  const isApplying = applySuggestions.isPending;
  
  // Default suggestions for initial state or when task is not selected
  const defaultSuggestions = [
    "Complete tasks with approaching deadlines first",
    "Break down large tasks into smaller subtasks",
    "Set realistic due dates for better time management"
  ];
  
  const displaySuggestions = suggestions.length > 0 
    ? suggestions.map(s => s.suggestion)
    : defaultSuggestions;
  
  if (!isExpanded) {
    return (
      <div className="mb-6 bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-800 dark:to-blue-700 rounded-lg shadow-lg cursor-pointer" onClick={() => setIsExpanded(true)}>
        <div className="px-4 py-3 flex items-center text-white">
          <Zap className="mr-2" />
          <h3 className="text-lg font-medium">AI Task Suggestions</h3>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-6 bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-800 dark:to-blue-700 rounded-lg shadow-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">AI Task Suggestions</h3>
            <div className="mt-2 max-w-xl text-sm text-indigo-100">
              <p>{task 
                ? "Based on your task details and deadlines, I suggest:" 
                : "Based on your recent activity and task patterns, I suggest:"}</p>
            </div>
            
            {isLoadingSuggestions || isGenerating ? (
              <div className="mt-4 bg-white bg-opacity-10 rounded-md p-4 space-y-3">
                <div className="animate-pulse h-5 bg-white bg-opacity-20 rounded"></div>
                <div className="animate-pulse h-5 bg-white bg-opacity-20 rounded"></div>
                <div className="animate-pulse h-5 bg-white bg-opacity-20 rounded"></div>
              </div>
            ) : (
              <div className="mt-4 bg-white bg-opacity-10 rounded-md p-4 space-y-3">
                {displaySuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center text-white">
                    {suggestion.toLowerCase().includes("priority") ? (
                      <AlertTriangle className="flex-shrink-0 h-5 w-5 mr-2" />
                    ) : (
                      <CheckCircle className="flex-shrink-0 h-5 w-5 mr-2" />
                    )}
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:flex-col sm:items-center sm:gap-2">
            {task && (
              <>
                <Button
                  onClick={() => generateSuggestions.mutate()}
                  disabled={isGenerating || isApplying}
                  size="sm"
                  variant="outline"
                  className="bg-white text-indigo-700 hover:bg-indigo-50 w-full"
                >
                  {isGenerating ? "Generating..." : "Refresh"}
                </Button>
                
                <Button
                  onClick={() => applySuggestions.mutate()}
                  disabled={isGenerating || isApplying || suggestions.length === 0}
                  size="sm"
                  className="bg-white text-indigo-700 hover:bg-indigo-50 w-full"
                >
                  {isApplying ? "Applying..." : "Apply Suggestions"}
                </Button>
              </>
            )}
            
            <Button
              onClick={() => setIsExpanded(false)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-indigo-800 hover:bg-opacity-50 w-full"
            >
              Minimize
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
