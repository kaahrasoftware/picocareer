
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
}

export function ChatInput({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  isDisabled 
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus the input field when the component mounts or isDisabled changes
  useEffect(() => {
    if (!isDisabled) {
      inputRef.current?.focus();
    }
  }, [isDisabled]);
  
  // Handle sending messages with Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(inputMessage);
    }
  };
  
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          ref={inputRef}
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          className="min-h-[60px] resize-none"
        />
        <Button 
          size="icon" 
          onClick={() => onSendMessage(inputMessage)}
          disabled={!inputMessage.trim() || isDisabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
