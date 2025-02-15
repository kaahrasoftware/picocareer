
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessageWithSender } from "@/types/database/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";
import { Send, Clock, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatMessagesProps {
  room: ChatRoom;
  hubId: string;
}

const REACTION_EMOJIS = {
  'thumbs-up': '👍',
  'thumbs-down': '👎',
  'heart': '❤️',
  'smile': '😊',
  'laugh': '😂',
  'angry': '😠',
  'frown': '😞',
  'meh': '😐'
} as const;

export function ChatMessages({ room, hubId }: ChatMessagesProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { session } = useAuthSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = ['chat-messages', room.id];

  const { data: messages = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const messagesResponse = await supabase
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

      if (messagesResponse.error) throw messagesResponse.error;

      if (messagesResponse.data.length > 0) {
        const messageIds = messagesResponse.data.map(msg => msg.id);
        
        const reactionsResponse = await supabase
          .from('hub_chat_reactions')
          .select('*')
          .in('message_id', messageIds);

        if (reactionsResponse.error) throw reactionsResponse.error;

        const messageReactions = new Map();
        reactionsResponse.data.forEach(reaction => {
          const existing = messageReactions.get(reaction.message_id) || [];
          messageReactions.set(reaction.message_id, [...existing, reaction]);
        });

        return messagesResponse.data.map(message => ({
          ...message,
          reactions: messageReactions.get(message.id) || []
        }));
      }

      return messagesResponse.data.map(message => ({
        ...message,
        reactions: []
      }));
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
          
          const { data: messageWithSender, error } = await supabase
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
            console.error('Error fetching message details:', error);
            return;
          }

          queryClient.setQueryData(queryKey, (old: ChatMessageWithSender[] | undefined) => {
            if (!old) return [messageWithSender];
            return [...old, { ...messageWithSender, reactions: [] }];
          });

          scrollToBottom();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hub_chat_reactions',
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, queryClient, queryKey]);

  const handleAddReaction = async (messageId: string, reactionType: keyof typeof REACTION_EMOJIS) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('hub_chat_reactions')
        .insert({
          message_id: messageId,
          user_id: session.user.id,
          reaction_type: reactionType
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          await supabase
            .from('hub_chat_reactions')
            .delete()
            .match({
              message_id: messageId,
              user_id: session.user.id,
              reaction_type: reactionType
            });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive",
      });
    }
  };

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
            const reactionCounts: Record<string, number> = {};
            
            msg.reactions?.forEach(reaction => {
              reactionCounts[reaction.reaction_type] = (reactionCounts[reaction.reaction_type] || 0) + 1;
            });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isCurrentUser ? "items-end" : "items-start"
                }`}
              >
                <div className="relative max-w-[80%]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 absolute top-1/2 -translate-y-1/2 ${
                          isCurrentUser ? "-left-8" : "-right-8"
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-auto p-2" 
                      align={isCurrentUser ? "start" : "end"}
                      side="top"
                    >
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                          <button
                            key={type}
                            onClick={() => handleAddReaction(msg.id, type as keyof typeof REACTION_EMOJIS)}
                            className={`text-sm px-2 py-0.5 rounded-full ${
                              reactionCounts[type]
                                ? 'bg-primary/20'
                                : 'hover:bg-primary/10'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <div
                    className={`rounded-lg px-4 py-2 shadow-sm ${
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
                    <div className="break-words text-sm">
                      {msg.content}
                    </div>
                  </div>
                </div>
                {Object.keys(reactionCounts).length > 0 && (
                  <div className={`mt-1 flex flex-wrap gap-1 ${
                    isCurrentUser ? "pr-8" : "pl-8"
                  }`}>
                    {Object.entries(reactionCounts)
                      .filter(([_, count]) => count > 0)
                      .map(([type, count]) => (
                        <button
                          key={type}
                          onClick={() => handleAddReaction(msg.id, type as keyof typeof REACTION_EMOJIS)}
                          className="text-sm px-2 py-0.5 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
                        >
                          {REACTION_EMOJIS[type as keyof typeof REACTION_EMOJIS]} {count}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
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
