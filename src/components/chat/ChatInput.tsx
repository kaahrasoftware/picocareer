
import React, { useState, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  inputMessage,
  setInputMessage,
  onSendMessage,
  isDisabled = false,
  placeholder = "Type your message..."
}: ChatInputProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle typing indicator with debounce
  useEffect(() => {
    if (inputMessage && !isTyping) {
      setIsTyping(true);
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
      }
    }, 1000);

    setTypingTimeout(timeout);

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [inputMessage, isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && !isDisabled) {
        onSendMessage(inputMessage.trim());
      }
    }
  };

  return (
    <div className="border-t bg-white p-3 flex gap-2 items-end">
      <Textarea
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        className="min-h-10 w-full resize-none bg-background border-muted"
        rows={1}
      />
      <Button
        size="icon"
        type="submit"
        disabled={!inputMessage.trim() || isDisabled}
        onClick={() => onSendMessage(inputMessage.trim())}
        className="rounded-full h-10 w-10 flex-shrink-0"
      >
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
}
