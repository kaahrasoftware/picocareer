
import { ChatRoom } from "@/types/database/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hash, Lock, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  onSelectRoom: (room: ChatRoom) => void;
  isLoading: boolean;
  isAdmin?: boolean;
  onRoomDeleted?: (roomId: string) => void;
}

export function ChatRoomList({
  rooms,
  selectedRoom,
  onSelectRoom,
  isLoading,
  isAdmin = false,
  onRoomDeleted,
}: ChatRoomListProps) {
  const { toast } = useToast();

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('hub_chat_rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      toast({
        title: "Room deleted",
        description: "The chat room has been deleted successfully.",
      });

      // Notify parent component about the deletion
      onRoomDeleted?.(roomId);
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete the chat room. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 bg-muted rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center gap-2">
            <Button
              variant={selectedRoom?.id === room.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectRoom(room)}
            >
              {room.type === 'private' ? (
                <Lock className="h-4 w-4 mr-2 opacity-70" />
              ) : (
                <Hash className="h-4 w-4 mr-2 opacity-70" />
              )}
              <span className="truncate">
                {room.name}
                {room.type === 'public' && " (Public)"}
              </span>
            </Button>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete chat room</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this chat room? This action cannot be undone.
                      All messages in this room will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteRoom(room.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
