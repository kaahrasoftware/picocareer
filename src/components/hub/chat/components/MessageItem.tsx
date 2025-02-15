
import { ChatMessageWithSender } from "@/types/database/chat";
import { FileIcon, Clock } from "lucide-react";
import { format } from "date-fns";

interface MessageItemProps {
  msg: ChatMessageWithSender;
  isCurrentUser: boolean;
}

export function MessageItem({ msg, isCurrentUser }: MessageItemProps) {
  const renderAttachment = (msg: ChatMessageWithSender) => {
    if (!msg.file_url) return msg.content;

    if (msg.file_type?.startsWith('image/')) {
      return <img src={msg.file_url} alt={msg.content} className="max-w-full h-auto rounded-lg" />;
    }
    
    if (msg.file_type?.startsWith('video/')) {
      return <video src={msg.file_url} controls className="max-w-full rounded-lg">Your browser doesn't support video playback.</video>;
    }

    const getFileIcon = () => {
      if (msg.file_type?.includes('pdf')) return <FileIcon className="h-6 w-6 text-red-500" />;
      if (msg.file_type?.includes('word')) return <FileIcon className="h-6 w-6 text-blue-500" />;
      if (msg.file_type?.includes('sheet') || msg.file_type?.includes('excel')) return <FileIcon className="h-6 w-6 text-green-500" />;
      if (msg.file_type?.includes('presentation')) return <FileIcon className="h-6 w-6 text-orange-500" />;
      return <FileIcon className="h-6 w-6" />;
    };

    return (
      <a 
        href={msg.file_url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center gap-2 hover:underline"
      >
        {getFileIcon()}
        <span>{msg.content}</span>
      </a>
    );
  };

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
            {msg.sender.full_name || "Unknown User"}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(msg.created_at), 'HH:mm')}
          </span>
        </div>
        <div className="break-words text-sm whitespace-pre-wrap">
          {renderAttachment(msg)}
        </div>
      </div>
    </div>
  );
}
