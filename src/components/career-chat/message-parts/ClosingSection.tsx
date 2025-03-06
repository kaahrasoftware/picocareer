
import React from 'react';
import { CheckCircle, ChevronRight, RefreshCw, FileCheck, Download } from 'lucide-react';

interface ClosingSectionProps {
  message: string;
  nextSteps: string[];
  onNextStepClick?: (step: string) => void;
  category?: string;
  isSessionComplete?: boolean;
}

export function ClosingSection({ 
  message, 
  nextSteps, 
  onNextStepClick, 
  category,
  isSessionComplete = false
}: ClosingSectionProps) {
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
        return isSessionComplete 
          ? "from-green-50 to-emerald-50 border-green-100 text-green-600" 
          : "from-blue-50 to-green-50 border-green-100 text-green-500";
      default:
        return "from-blue-50 to-green-50 border-green-100 text-green-500";
    }
  };

  const styles = getCategoryStyles().split(' ');
  const colorClass = styles[styles.length - 1]; // Extract the text color class

  // Default next steps for a completed session if none provided
  const defaultNextSteps = [
    "Start a new career assessment",
    "Explore these career paths in detail",
    "Download these recommendations"
  ];

  // Use provided next steps or default ones if session is complete
  const actualNextSteps = isSessionComplete && (!nextSteps || nextSteps.length === 0) 
    ? defaultNextSteps 
    : nextSteps;

  const getIcon = (step: string) => {
    if (step.toLowerCase().includes('new') || step.toLowerCase().includes('start')) {
      return <RefreshCw className="h-4 w-4 text-blue-500 mr-2" />;
    } else if (step.toLowerCase().includes('save') || step.toLowerCase().includes('download')) {
      return <Download className="h-4 w-4 text-green-500 mr-2" />;
    } else {
      return <ChevronRight className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getCategoryStyles().replace(colorClass, '')} p-5 rounded-lg shadow-sm border`}>
      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        <CheckCircle className={`h-5 w-5 ${colorClass} mr-2`} />
        {isSessionComplete ? "Assessment Complete" : "Next Steps"}
      </h3>
      <p className="text-gray-600 mb-4">{message}</p>
      
      {actualNextSteps && actualNextSteps.length > 0 && (
        <div className="space-y-2">
          {actualNextSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => onNextStepClick && onNextStepClick(step)}
              className={`flex items-center w-full p-3 bg-white rounded-md border border-gray-100 hover:shadow-sm transition-all text-left ${
                isSessionComplete ? 'hover:border-green-100' : ''
              }`}
            >
              {getIcon(step)}
              <span className="flex-1 text-sm text-gray-700">{step}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}
      
      {isSessionComplete && (
        <div className="mt-4 pt-3 border-t border-green-100">
          <p className="text-xs text-green-600 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Your assessment is complete and your results have been saved
          </p>
        </div>
      )}
    </div>
  );
}
