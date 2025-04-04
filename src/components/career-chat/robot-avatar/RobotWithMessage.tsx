
import React from "react";
import { RobotAvatar } from "./RobotAvatar";
import { cn } from "@/lib/utils";

interface RobotWithMessageProps {
  message?: string;
  className?: string;
  isTyping?: boolean;
}

export function RobotWithMessage({
  message,
  className,
  isTyping = false,
}: RobotWithMessageProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RobotAvatar isPulsing={isTyping} />
      
      {message && (
        <div className="text-sm font-medium text-muted-foreground">
          {message}
          {isTyping && (
            <span className="inline-block ml-1">
              <span className="animate-[pulse_1s_ease-in-out_infinite] opacity-70">.</span>
              <span className="animate-[pulse_1s_ease-in-out_0.2s_infinite] opacity-70">.</span>
              <span className="animate-[pulse_1s_ease-in-out_0.4s_infinite] opacity-70">.</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
