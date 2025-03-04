
import React from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';

interface ClosingSectionProps {
  message: string;
  nextSteps: string[];
  onNextStepClick?: (step: string) => void;
}

export function ClosingSection({ message, nextSteps, onNextStepClick }: ClosingSectionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-5 rounded-lg shadow-sm border border-green-100">
      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        Next Steps
      </h3>
      <p className="text-gray-600 mb-4">{message}</p>
      
      {nextSteps && nextSteps.length > 0 && (
        <div className="space-y-2">
          {nextSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => onNextStepClick && onNextStepClick(step)}
              className="flex items-center w-full p-3 bg-white rounded-md border border-green-100 hover:shadow-sm transition-all text-left"
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
