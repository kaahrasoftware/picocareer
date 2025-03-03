
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BotMessageProps {
  content: string;
}

export function BotMessage({ content }: BotMessageProps) {
  // Check if this is an error message
  const isError = content.includes("error") && content.includes("I'm sorry");
  
  // Try to extract just the conversational part if it's JSON or contains numbered options
  const cleanedContent = React.useMemo(() => {
    if (content.includes('```json') || content.includes('```')) {
      // Remove code blocks to display only the conversation text
      return content.replace(/```(?:json)?\n[\s\S]*?\n```/g, '')
        .replace(/\{[\s\S]*\}/g, '') // Remove any remaining JSON objects
        .trim();
    }
    
    // Check if this is a message with numbered options (1. Option, 2. Option, etc.)
    if (/\d+\.\s+\w+/.test(content)) {
      // Split the content by the first numbered option
      const parts = content.split(/\d+\.\s+\w+/);
      if (parts.length > 1) {
        // Return just the text part before the options
        return parts[0].trim();
      }
    }
    
    return content;
  }, [content]);

  return (
    <div className="flex flex-col items-start mb-4 animate-fade-in">
      <div className={cn(
        "max-w-[95%] rounded-xl px-5 py-4 shadow-md transition-all duration-300 hover:shadow-lg",
        isError 
          ? "bg-gradient-to-br from-red-50 to-white border border-red-200" 
          : "bg-gradient-to-br from-blue-50 to-white border border-blue-200"
      )}>
        {isError ? (
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{cleanedContent}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{cleanedContent}</p>
        )}
      </div>
    </div>
  );
}
