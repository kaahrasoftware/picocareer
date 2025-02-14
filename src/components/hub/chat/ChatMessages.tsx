import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessageWithSender, ChatReaction } from "@/types/database/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";
import { Send, Clock, SmilePlus, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { session } = useAuthSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = ['chat-messages', room.id];

  const { data: messages, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const [messagesResponse, reactionsResponse] = await Promise.all([
        supabase
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
          .order('created_at', { ascending: true }),
        supabase
          .from('hub_chat_reactions')
          .select('*')
          .eq('message_id', room.id)
      ]);

      if (messagesResponse.error) throw messagesResponse.error;
      if (reactionsResponse.error) throw reactionsResponse.error;

      const messagesWithReactions = messagesResponse.data.map(message => ({
        ...message,
        reactions: reactionsResponse.data.filter(r => r.message_id === message.id)
      }));

      return messagesWithReactions as ChatMessageWithSender[];
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

      // Automatically hide reactions after selection
      setExpandedMessageId(null);
      
      // Refresh messages to update reactions
      await queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const toggleReactions = (messageId: string) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

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
            const reactionCounts = msg.reactions?.reduce((acc, reaction) => {
              acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>) || {};
            const isExpanded = expandedMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
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
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(reactionCounts)
                          .filter(([_, count]) => count > 0)
                          .map(([type, count]) => (
                            <span
                              key={type}
                              className="text-sm px-2 py-0.5 rounded-full bg-primary/20"
                            >
                              {REACTION_EMOJIS[type as keyof typeof REACTION_EMOJIS]} {count}
                            </span>
                          ))}
                      </div>
                    </div>
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
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  <SmilePlus className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Picker 
                  data={data} 
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
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
            className="px-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
