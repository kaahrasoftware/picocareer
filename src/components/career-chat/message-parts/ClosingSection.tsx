
import React from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';

interface ClosingSectionProps {
  message: string;
  nextSteps: string[];
  onNextStepClick?: (step: string) => void;
  category?: string;
}

export function ClosingSection({ message, nextSteps, onNextStepClick, category }: ClosingSectionProps) {
  // Define category-specific styles
  const getCategoryStyles = () => {
    switch (category) {
      case 'education':
        return "from-indigo-50 to-blue-50 border-indigo-100 text-indigo-500";
      case 'skills':
        return "from-emerald-50 to-green-50 border-emerald-100 text-emerald-500";
      case 'workstyle':
        return "from-amber-50 to-yellow-50 border-amber-100 text-amber-500";
      case 'goals':
        return "from-blue-50 to-sky-50 border-blue-100 text-blue-500";
      case 'complete':
        return "from-blue-50 to-green-50 border-green-100 text-green-500";
      default:
        return "from-blue-50 to-green-50 border-green-100 text-green-500";
    }
  };

  const styles = getCategoryStyles().split(' ');
  const colorClass = styles[styles.length - 1]; // Extract the text color class

  return (
    <div className={`bg-gradient-to-r ${getCategoryStyles().replace(colorClass, '')} p-5 rounded-lg shadow-sm border`}>
      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        <CheckCircle className={`h-5 w-5 ${colorClass} mr-2`} />
        Next Steps
      </h3>
      <p className="text-gray-600 mb-4">{message}</p>
      
      {nextSteps && nextSteps.length > 0 && (
        <div className="space-y-2">
          {nextSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => onNextStepClick && onNextStepClick(step)}
              className="flex items-center w-full p-3 bg-white rounded-md border border-gray-100 hover:shadow-sm transition-all text-left"
            >
              <span className="flex-1 text-sm text-gray-700">{step}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
