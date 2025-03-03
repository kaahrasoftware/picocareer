
import React from "react";

interface ChatHeaderProps {
  name: string;
  description?: string;
}

export function ChatHeader({ name, description }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b bg-card">
      <h3 className="font-semibold text-lg">{name}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
