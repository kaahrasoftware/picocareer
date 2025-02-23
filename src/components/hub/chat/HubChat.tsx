
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom } from "@/types/database/chat";
import { ChatRoomList } from "./ChatRoomList";
import { ChatMessages } from "./ChatMessages";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateRoomDialog } from "./CreateRoomDialog";

interface HubChatProps {
  hubId: string;
  isAdmin: boolean;
  isModerator: boolean;
}

export function HubChat({
  hubId,
  isAdmin,
  isModerator
}: HubChatProps) {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const {
    session
  } = useAuthSession();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data: rooms,
    isLoading: roomsLoading
  } = useQuery({
    queryKey: ['hub-chat-rooms', hubId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('hub_chat_rooms').select('*').eq('hub_id', hubId).order('created_at', {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (rooms?.length && !selectedRoom) {
      // Select the first public channel by default for non-members
      const defaultRoom = rooms.find(room => room.type === 'public') || rooms[0];
      setSelectedRoom(defaultRoom);
    }
  }, [rooms, selectedRoom]);

  const handleRoomDeleted = (deletedRoomId: string) => {
    // If the deleted channel was selected, clear the selection and select another channel
    if (selectedRoom?.id === deletedRoomId) {
      setSelectedRoom(null); // First clear the selection
      // Then find another channel to select
      const remainingRooms = rooms?.filter(room => room.id !== deletedRoomId);
      if (remainingRooms?.length) {
        const nextRoom = remainingRooms.find(room => room.type === 'public') || remainingRooms[0];
        setSelectedRoom(nextRoom);
      }
    }
    // Invalidate the rooms query to refresh the list
    queryClient.invalidateQueries({
      queryKey: ['hub-chat-rooms', hubId]
    });
  };

  // Subscribe to channel changes (including deletions)
  useEffect(() => {
    const channel = supabase.channel('hub-chat-rooms').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'hub_chat_rooms',
      filter: `hub_id=eq.${hubId}`
    }, payload => {
      console.log('Channel change received:', payload);

      // If a channel is deleted, handle it
      if (payload.eventType === 'DELETE' && payload.old?.id === selectedRoom?.id) {
        setSelectedRoom(null);
      }

      // Refetch channels when changes occur
      queryClient.invalidateQueries({
        queryKey: ['hub-chat-rooms', hubId]
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [hubId, queryClient, selectedRoom]);

  if (!session) {
    return <div className="p-8 text-center">
        <p>Please sign in to access channels.</p>
      </div>;
  }

  return <div className="flex h-[600px] rounded-lg border">
      <div className="w-64 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-2">Channels</h2>
          {(isAdmin || isModerator) && <Button onClick={() => setShowCreateRoom(true)} variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Channel
            </Button>}
        </div>
        <ChatRoomList rooms={rooms || []} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} isLoading={roomsLoading} isAdmin={isAdmin} onRoomDeleted={handleRoomDeleted} />
      </div>
      
      <div className="flex-1 flex flex-col">
        {selectedRoom ? <ChatMessages room={selectedRoom} hubId={hubId} /> : <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a channel to start chatting
          </div>}
      </div>

      {showCreateRoom && <CreateRoomDialog hubId={hubId} onClose={() => setShowCreateRoom(false)} />}
    </div>;
}
