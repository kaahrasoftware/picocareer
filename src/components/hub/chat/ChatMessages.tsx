
import React from "react";
import { ChatRoom } from "@/types/database/chat";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { useChatMessages } from "./hooks/useChatMessages";

interface ChatMessagesProps {
  room: ChatRoom;
  hubId: string;
}

export function ChatMessages({ room }: ChatMessagesProps) {
  const { messages, isLoading, sendMessage } = useChatMessages(room);

  return (
    <>
      <ChatHeader name={room.name} description={room.description} />
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      ) : messages?.length ? (
        <MessageList messages={messages} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
      )}
      
      <ChatInput onSendMessage={sendMessage} />
    </>
  );
}
