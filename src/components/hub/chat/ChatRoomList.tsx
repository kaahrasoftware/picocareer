
import { ChatRoom } from "@/types/database/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hash, Lock } from "lucide-react";

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  onSelectRoom: (room: ChatRoom) => void;
  isLoading: boolean;
}

export function ChatRoomList({
  rooms,
  selectedRoom,
  onSelectRoom,
  isLoading,
}: ChatRoomListProps) {
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
          <Button
            key={room.id}
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
        ))}
      </div>
    </ScrollArea>
  );
}
