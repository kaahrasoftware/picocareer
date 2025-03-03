
import React from "react";
import { ChatMessageWithSender } from "@/types/database/chat";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { useAuthSession } from "@/hooks/useAuthSession";

interface ChatMessageProps {
  message: ChatMessageWithSender;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { session } = useAuthSession();
  const isCurrentUser = message.sender_id === session?.user?.id;

  return (
    <div
      className={`flex ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-background border"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium ${
            isCurrentUser ? "text-primary-foreground" : "text-indigo-600"
          }`}>
            {message.sender.full_name || "Unknown User"}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
        </div>
        <div className="break-words text-sm whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
}
