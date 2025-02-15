
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessageWithSender } from "@/types/database/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";
import { Send, Clock, Smile } from "lucide-react";
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

  const handleSendMessage = async () => {
    if (!message.trim() || !session?.user) return;

    try {
      const { data: newMessage, error } = await supabase
        .from('hub_chat_messages')
        .insert({
          room_id: room.id,
          sender_id: session.user.id,
          content: message.trim(),
          type: 'text'
        })
        .select(`
          *,
          sender:profiles!hub_chat_messages_sender_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      queryClient.setQueryData<ChatMessageWithSender[]>(queryKey, (oldMessages) => {
        if (!oldMessages) return [newMessage];
        return [...oldMessages, newMessage];
      });

      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setMessage(prev => prev + emojiData.emoji);
  };

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
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
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
    </>
  );
}
