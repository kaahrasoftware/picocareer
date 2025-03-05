
import React from 'react';
import { ThumbsUp, ArrowRight } from 'lucide-react';
import { TestResultClosing } from '../../utils/recommendationParser';

interface ClosingSectionProps {
  closing: TestResultClosing;
  onSuggestionClick?: (suggestion: string) => void;
}

export function ClosingSection({ closing, onSuggestionClick }: ClosingSectionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg border border-blue-100">
      <div className="flex items-start mb-4">
        <ThumbsUp className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Assessment Complete
          </h3>
          <p className="text-gray-600">
            {closing.message}
          </p>
        </div>
      </div>
      
      {closing.nextSteps && closing.nextSteps.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Next Steps:</h4>
          <div className="flex flex-wrap gap-2">
            {closing.nextSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick?.(step)}
                className="flex items-center text-sm bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                {step}
                <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
