
import React from 'react';
import { SendIcon, Download, Plus, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
  isSessionComplete?: boolean;
  placeholderText?: string;
  onDownloadResults?: () => void;
  onStartNewChat?: () => void;
}

export function ChatInput({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  isDisabled = false,
  isSessionComplete = false,
  placeholderText = "Type your message...",
  onDownloadResults,
  onStartNewChat
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  // Common example questions/suggestions to help users
  const suggestions = [
    "Tell me more about software development",
    "What careers match creative skills?",
    "Which careers have good work-life balance?"
  ];

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white/50 backdrop-blur-sm rounded-b-lg">
      {isSessionComplete ? (
        <div className="flex flex-col gap-2">
          <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-2">
            <p className="text-sm text-center text-gray-700">
              Your assessment is complete! You can explore specific careers in more detail or start a new assessment.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            {onStartNewChat && (
              <Button 
                type="button" 
                variant="default"
                className="flex-1 gap-2"
                onClick={onStartNewChat}
              >
                <Plus className="h-4 w-4" />
                New Assessment
              </Button>
            )}
            {onDownloadResults && (
              <Button 
                type="button" 
                variant="outline"
                className="flex-1 gap-2"
                onClick={onDownloadResults}
              >
                <Download className="h-4 w-4" />
                Download Results
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={placeholderText}
              disabled={isDisabled || isSessionComplete}
              className={`flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm ${
                isSessionComplete ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-white'
              }`}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isDisabled || !inputMessage.trim() || isSessionComplete}
              className="rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <SendIcon className="h-5 w-5" />
            </Button>
          </div>
          
          {!isDisabled && !isSessionComplete && (
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              <span className="text-muted-foreground mr-1">Try asking:</span>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setInputMessage(suggestion);
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
