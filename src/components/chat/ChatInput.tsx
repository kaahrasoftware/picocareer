
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
    <form onSubmit={handleSubmit} className="p-4 bg-background border-t border-border/50 mt-4">
      <div className="flex items-center gap-2 bg-card border border-border/50 rounded-lg p-2 backdrop-blur-sm">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isDisabled}
          className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
        />
        <Button 
          type="submit" 
          size="icon"
          variant="default"
          disabled={isDisabled || !inputMessage.trim()}
          className="rounded-full h-10 w-10 flex items-center justify-center"
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
