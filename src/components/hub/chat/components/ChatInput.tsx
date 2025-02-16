
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Paperclip, Send, X } from "lucide-react";
import { FilePreview } from "./FilePreview";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EmojiPicker } from "emoji-picker-react";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  selectedFile: File | null;
  filePreview: string | null;
  isUploading: boolean;
  onEmojiClick: (emojiData: { emoji: string }) => void;
  onFileSelect: () => void;
  onClearFile: () => void;
  onSendMessage: () => void;
}

export function ChatInput({
  message,
  setMessage,
  selectedFile,
  filePreview,
  isUploading,
  onEmojiClick,
  onFileSelect,
  onClearFile,
  onSendMessage,
}: ChatInputProps) {
  return (
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
        <Button
          variant="outline"
          size="icon"
          className="h-[60px]"
          onClick={onFileSelect}
          disabled={isUploading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[60px] bg-background pr-8"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
          />
          {selectedFile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 rounded-full p-0 text-muted-foreground hover:text-foreground"
              onClick={onClearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {selectedFile && (
            <FilePreview 
              file={selectedFile} 
              filePreview={filePreview} 
            />
          )}
        </div>
      </div>
      <Button
        onClick={onSendMessage}
        disabled={(!message.trim() && !selectedFile) || isUploading}
        className="px-8 h-[60px]"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
