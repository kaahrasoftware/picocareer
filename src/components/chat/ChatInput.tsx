
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
          disabled={isDisabled}
          className={`flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm ${
            isSessionComplete ? 'bg-gray-50 border-gray-200' : 'bg-white'
          }`}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isDisabled || !inputMessage.trim()}
          className={`rounded-full shadow-sm hover:shadow-md transition-all ${
            isSessionComplete ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
