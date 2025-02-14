
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessageWithSender } from "@/types/database/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface ChatMessagesProps {
  room: ChatRoom;
  hubId: string;
}

export function ChatMessages({ room, hubId }: ChatMessagesProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { session } = useAuthSession();
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['chat-messages', room.id],
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
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ChatMessageWithSender[];
    },
  });

  useEffect(() => {
    // Subscribe to new messages
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
        (payload) => {
          console.log('New message received:', payload);
          // Refetch messages when a new one arrives
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !session?.user) return;

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
  };

  return (
    <>
      <div className="p-4 border-b">
        <h3 className="font-semibold">{room.name}</h3>
        {room.description && (
          <p className="text-sm text-muted-foreground">{room.description}</p>
        )}
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === session?.user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.sender_id === session?.user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {msg.sender.full_name || "Unknown User"}
                </div>
                <div className="break-words">{msg.content}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="px-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
