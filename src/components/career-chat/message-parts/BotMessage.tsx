
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface BotMessageProps {
  content: string;
}

export function BotMessage({ content }: BotMessageProps) {
  // Check if this is an error message
  const isError = content.includes("error") && content.includes("I'm sorry");
  
  // Try to extract just the conversational part if it's JSON
  const cleanedContent = React.useMemo(() => {
    if (content.includes('```json') || content.includes('```')) {
      // Remove code blocks to display only the conversation text
      return content.replace(/```(?:json)?\n[\s\S]*?\n```/g, '')
        .replace(/\{[\s\S]*\}/g, '') // Remove any remaining JSON objects
        .trim();
    }
    return content;
  }, [content]);

  return (
    <div className="flex flex-col items-start mb-4">
      <div className={`max-w-[95%] rounded-lg px-4 py-3 shadow-sm ${
        isError ? 'bg-red-50 border border-red-200' : 'bg-white border border-blue-100'
      } transition-all hover:shadow`}>
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
