
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Info, AlertTriangle } from 'lucide-react';

interface SystemMessageProps {
  content: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  isDisabled?: boolean;
}

export function SystemMessage({ 
  content, 
  suggestions, 
  onSuggestionClick, 
  isDisabled = false 
}: SystemMessageProps) {
  const isError = content.toLowerCase().includes('error') || 
                 content.toLowerCase().includes('sorry');
  
  const isBeginAssessment = suggestions && 
    suggestions.length === 1 && 
    suggestions[0] === "Begin Assessment";

  return (
    <div className={cn(
      "relative p-4 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-700",
      isError ? "border-l-4 border-l-red-500" : "border-l-4 border-l-primary"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isError ? "bg-red-100 text-red-500" : "bg-primary/10 text-primary"
        )}>
          {isError ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
          
          {suggestions && suggestions.length > 0 && onSuggestionClick && !isBeginAssessment && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onSuggestionClick(suggestion)}
                  disabled={isDisabled}
                  className={cn(
                    "text-xs font-normal transition-all",
                    isDisabled ? "opacity-70" : "hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          
          {isBeginAssessment && onSuggestionClick && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => onSuggestionClick("Begin Assessment")}
                disabled={isDisabled}
                className={cn(
                  "font-medium transition-all",
                  isDisabled ? "opacity-70" : "hover:scale-105 shadow-sm hover:shadow-md"
                )}
              >
                Begin Assessment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
