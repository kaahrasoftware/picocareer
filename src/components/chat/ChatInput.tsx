
import React from 'react';
import { SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
}

export function ChatInput({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  isDisabled = false 
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-background">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isDisabled}
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isDisabled || !inputMessage.trim()}
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
