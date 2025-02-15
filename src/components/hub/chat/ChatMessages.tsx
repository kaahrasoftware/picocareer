import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessageWithSender } from "@/types/database/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";
import { MessageItem } from "./components/MessageItem";
import { ChatInput } from "./components/ChatInput";

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
    refetchOnWindowFocus: false,
    staleTime: Infinity, // Prevent automatic refetching
  });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const channel = supabase.channel(`room:${room.id}`)
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
          
          const newMessage = payload.new as ChatMessageWithSender;
          
          const { data: senderData, error: senderError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();
            
          if (senderError) {
            console.error('Error fetching sender:', senderError);
            return;
          }

          const messageWithSender = {
            ...newMessage,
            sender: senderData
          };

          queryClient.setQueryData<ChatMessageWithSender[]>(
            queryKey,
            (oldMessages = []) => {
              if (oldMessages.some(msg => msg.id === messageWithSender.id)) {
                return oldMessages;
              }
              return [...oldMessages, messageWithSender];
            }
          );

          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for room ${room.id}:`, status);
      });

    return () => {
      console.log(`Unsubscribing from room ${room.id}`);
      supabase.removeChannel(channel);
    };
  }, [room.id, queryClient, queryKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages?.length]);

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
        setFilePreview(null);
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
          {messages?.map((msg) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              isCurrentUser={msg.sender_id === session?.user?.id}
            />
          ))}
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
        <ChatInput
          message={message}
          setMessage={setMessage}
          selectedFile={selectedFile}
          filePreview={filePreview}
          isUploading={isUploading}
          onEmojiClick={onEmojiClick}
          onFileSelect={() => fileInputRef.current?.click()}
          onClearFile={clearSelectedFile}
          onSendMessage={handleSendMessage}
        />
      </div>
    </>
  );
}
