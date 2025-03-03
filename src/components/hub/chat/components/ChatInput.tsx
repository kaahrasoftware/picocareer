
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Smile } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await onSendMessage(message);
    setMessage("");
  };

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  return (
    <div className="p-4 border-t bg-card">
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-[60px]"
                type="button"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" side="top" align="start">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width="100%"
                height={400}
              />
            </PopoverContent>
          </Popover>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[60px] bg-background"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="px-8 h-[60px]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
