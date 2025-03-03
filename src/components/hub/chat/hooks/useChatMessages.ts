
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessageWithSender } from "@/types/database/chat";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";

export function useChatMessages(room: ChatRoom) {
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

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session?.user) {
      return;
    }

    try {
      const { data: newMessage, error } = await supabase
        .from('hub_chat_messages')
        .insert({
          room_id: room.id,
          sender_id: session.user.id,
          content: content.trim(),
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
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { messages, isLoading, sendMessage };
}
