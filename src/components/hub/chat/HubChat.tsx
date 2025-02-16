
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

export function HubChat({ hubId, isAdmin, isModerator }: HubChatProps) {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const { session } = useAuthSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['hub-chat-rooms', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_chat_rooms')
        .select('*')
        .eq('hub_id', hubId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (rooms?.length && !selectedRoom) {
      // Select the first public room by default for non-members
      const defaultRoom = rooms.find(room => room.type === 'public') || rooms[0];
      setSelectedRoom(defaultRoom);
    }
  }, [rooms, selectedRoom]);

  const handleRoomDeleted = (deletedRoomId: string) => {
    // If the deleted room was selected, select another room
    if (selectedRoom?.id === deletedRoomId) {
      const remainingRooms = rooms?.filter(room => room.id !== deletedRoomId);
      const nextRoom = remainingRooms?.find(room => room.type === 'public') || remainingRooms?.[0];
      setSelectedRoom(nextRoom || null);
    }
    // Invalidate the rooms query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['hub-chat-rooms', hubId] });
  };

  // Subscribe to new rooms
  useEffect(() => {
    const channel = supabase
      .channel('hub-chat-rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hub_chat_rooms',
          filter: `hub_id=eq.${hubId}`,
        },
        (payload) => {
          console.log('Room change received:', payload);
          // Refetch rooms when changes occur
          queryClient.invalidateQueries({ queryKey: ['hub-chat-rooms', hubId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hubId, queryClient]);

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p>Please sign in to access chat rooms.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] rounded-lg border">
      <div className="w-64 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-2">Chat Rooms</h2>
          {(isAdmin || isModerator) && (
            <Button
              onClick={() => setShowCreateRoom(true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Room
            </Button>
          )}
        </div>
        <ChatRoomList
          rooms={rooms || []}
          selectedRoom={selectedRoom}
          onSelectRoom={setSelectedRoom}
          isLoading={roomsLoading}
          isAdmin={isAdmin}
          onRoomDeleted={handleRoomDeleted}
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <ChatMessages
            room={selectedRoom}
            hubId={hubId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a room to start chatting
          </div>
        )}
      </div>

      {showCreateRoom && (
        <CreateRoomDialog
          hubId={hubId}
          onClose={() => setShowCreateRoom(false)}
        />
      )}
    </div>
  );
}
