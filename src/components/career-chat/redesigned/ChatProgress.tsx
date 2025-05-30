
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';

interface ChatProgressProps {
  currentCategory: string | null;
  questionProgress: number;
  isSessionComplete: boolean;
}

export function ChatProgress({ currentCategory, questionProgress, isSessionComplete }: ChatProgressProps) {
  const categories = [
    { key: 'education', label: 'Education', description: 'Your academic background' },
    { key: 'skills', label: 'Skills', description: 'Your abilities and expertise' },
    { key: 'workstyle', label: 'Work Style', description: 'How you prefer to work' },
    { key: 'goals', label: 'Goals', description: 'Your career aspirations' },
    { key: 'complete', label: 'Results', description: 'Your personalized recommendations' }
  ];

  const getCurrentStepIndex = () => {
    const index = categories.findIndex(cat => cat.key === currentCategory);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="bg-white border-b p-4 space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Assessment Progress</span>
          <span className="text-muted-foreground">
            {isSessionComplete ? '100%' : `${Math.round(questionProgress)}%`} complete
          </span>
        </div>
        <Progress 
          value={isSessionComplete ? 100 : questionProgress} 
          className="h-2"
        />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {categories.map((category, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex || isSessionComplete;
          const isCurrent = index === currentStepIndex && !isSessionComplete;

          return (
            <div key={category.key} className="flex flex-col items-center space-y-1 flex-1">
              <div className="flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : isCurrent ? (
                  <div className="h-6 w-6 rounded-full bg-blue-500 border-2 border-white shadow-md animate-pulse" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${
                  isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {category.label}
                </p>
                <p className={`text-xs ${
                  isActive || isCompleted ? 'text-gray-500' : 'text-gray-300'
                }`}>
                  {category.description}
                </p>
              </div>
              {index < categories.length - 1 && (
                <div className={`hidden sm:block h-px w-full ${
                  isCompleted ? 'bg-green-200' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
