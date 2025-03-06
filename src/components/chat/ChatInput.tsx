
import React from 'react';
import { SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
  isSessionComplete?: boolean;
  placeholderText?: string;
}

export function ChatInput({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  isDisabled = false,
  isSessionComplete = false,
  placeholderText = "Type your message..."
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white/50 rounded-b-lg">
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
          className={`rounded-full shadow-sm hover:shadow-md transition-all ${
            isSessionComplete ? 'bg-green-600 hover:bg-green-700 cursor-not-allowed opacity-70' : ''
          }`}
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </div>
      {isSessionComplete && (
        <p className="mt-2 text-xs text-center text-gray-500">
          This assessment is complete. You can explore specific careers or start a new assessment.
        </p>
      )}
    </form>
  );
}
