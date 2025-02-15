import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessageWithSender } from "@/types/database/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";
import { Send, Clock, Smile, Paperclip, FileIcon, ImageIcon, VideoIcon, X } from "lucide-react";
import { format } from "date-fns";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatMessagesProps {
  room: ChatRoom;
  hubId: string;
}

export function ChatMessages({ room, hubId }: ChatMessagesProps) {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { session } = useAuthSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = ['chat-messages', room.id];

  const { data: messages, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_chat_messages')
        .select(`
          *,
          sender:profiles!hub_chat_messages_sender_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('room_id', room.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ChatMessageWithSender[];
    },
  });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hub_chat_messages',
          filter: `room_id=eq.${room.id}`,
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          const { data: newMessage, error } = await supabase
            .from('hub_chat_messages')
            .select(`
              *,
              sender:profiles!hub_chat_messages_sender_id_fkey (
                id,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching new message:', error);
            return;
          }

          queryClient.setQueryData<ChatMessageWithSender[]>(queryKey, (oldMessages) => {
            if (!oldMessages) return [newMessage];
            return [...oldMessages, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, queryClient, queryKey]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setMessage(`[File: ${file.name}] `);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setMessage("");
    setFilePreview(null);
    if (filePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
  };

  const getFilePreviewContent = () => {
    if (!selectedFile) return null;

    if (selectedFile.type.startsWith('image/')) {
      return (
        <div className="mt-2 relative inline-block">
          <img 
            src={filePreview!} 
            alt="Preview" 
            className="max-h-32 rounded-lg"
          />
        </div>
      );
    }

    if (selectedFile.type.startsWith('video/')) {
      return (
        <div className="mt-2 relative inline-block">
          <video 
            src={filePreview!} 
            className="max-h-32 rounded-lg" 
            controls
          >
            Your browser doesn't support video preview.
          </video>
        </div>
      );
    }

    const getFileIcon = () => {
      if (selectedFile.type.includes('pdf')) return <FileIcon className="h-6 w-6 text-red-500" />;
      if (selectedFile.type.includes('word')) return <FileIcon className="h-6 w-6 text-blue-500" />;
      if (selectedFile.type.includes('sheet') || selectedFile.type.includes('excel')) return <FileIcon className="h-6 w-6 text-green-500" />;
      if (selectedFile.type.includes('presentation')) return <FileIcon className="h-6 w-6 text-orange-500" />;
      return <FileIcon className="h-6 w-6" />;
    };

    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        {getFileIcon()}
        <span>{selectedFile.name}</span>
      </div>
    );
  };

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !session?.user) return;

    if (selectedFile) {
      setIsUploading(true);
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${room.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('chat_attachments')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat_attachments')
          .getPublicUrl(filePath);

        const messageText = message.replace(`[File: ${selectedFile.name}] `, '').trim();

        const { error } = await supabase
          .from('hub_chat_messages')
          .insert({
            room_id: room.id,
            sender_id: session.user.id,
            content: messageText || selectedFile.name,
            type: 'attachment',
            file_url: publicUrl,
            file_type: selectedFile.type
          });

        if (error) throw error;

        setSelectedFile(null);
        setMessage("");
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Error",
          description: "Failed to upload file. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      try {
        const { error } = await supabase
          .from('hub_chat_messages')
          .insert({
            room_id: room.id,
            sender_id: session.user.id,
            content: message.trim(),
            type: 'text'
          });

        if (error) throw error;
        setMessage("");
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

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

  useEffect(() => {
    return () => {
      if (filePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  return (
    <>
      <div className="p-4 border-b bg-card">
        <h3 className="font-semibold text-lg">{room.name}</h3>
        {room.description && (
          <p className="text-sm text-muted-foreground">{room.description}</p>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((msg) => {
            const isCurrentUser = msg.sender_id === session?.user?.id;
            return (
              <div
                key={msg.id}
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
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = ''; // Reset input
        }}
        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
      />

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
            <Button
              variant="outline"
              size="icon"
              className="h-[60px]"
              onClick={() => fileInputRef.current?.click()}
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
                    handleSendMessage();
                  }
                }}
              />
              {selectedFile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 rounded-full p-0 text-muted-foreground hover:text-foreground"
                  onClick={clearSelectedFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {getFilePreviewContent()}
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={(!message.trim() && !selectedFile) || isUploading}
            className="px-8 h-[60px]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
