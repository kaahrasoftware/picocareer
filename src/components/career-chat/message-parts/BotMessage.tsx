
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BotMessageProps {
  content: string;
  category?: string;
}

export function BotMessage({ content, category }: BotMessageProps) {
  // Check if this is an error message
  const isError = content.includes("error") && content.includes("I'm sorry");
  
  // Get styles based on category - simplified for faster rendering
  const getCategoryGradient = () => {
    switch (category) {
      case 'education':
        return "from-indigo-50 to-white border-indigo-200";
      case 'skills':
        return "from-emerald-50 to-white border-emerald-200";
      case 'workstyle':
        return "from-amber-50 to-white border-amber-200";
      case 'goals':
        return "from-blue-50 to-white border-blue-200";
      case 'personality':
        return "from-purple-50 to-white border-purple-200";
      case 'complete':
        return "from-green-50 to-white border-green-200";
      default:
        return "from-blue-50 to-white border-blue-200";
    }
  };
  
  // Simplified content cleaning for faster processing
  const cleanedContent = React.useMemo(() => {
    if (content.includes('```json') || content.includes('```')) {
      return content.replace(/```(?:json)?\n[\s\S]*?\n```/g, '').trim();
    }
    return content;
  }, [content]);

  return (
    <div className="flex flex-col items-start mb-4 animate-fade-in" style={{animationDuration: '150ms'}}>
      <div className={cn(
        "max-w-[95%] rounded-xl px-4 py-3 shadow-sm",
        isError 
          ? "bg-gradient-to-br from-red-50 to-white border border-red-200" 
          : `bg-gradient-to-br ${getCategoryGradient()} border`
      )}>
        {isError ? (
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{cleanedContent}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{cleanedContent}</p>
        )}
      </div>
    </div>
  );
}
