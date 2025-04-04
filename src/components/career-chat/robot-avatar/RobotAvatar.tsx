
import React from "react";
import { cn } from "@/lib/utils";

interface RobotAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl"; 
  isAnimated?: boolean;
  isPulsing?: boolean;
  showSpeechBubble?: boolean;
}

export function RobotAvatar({
  className,
  size = "md",
  isAnimated = true,
  isPulsing = false,
  showSpeechBubble = false,
}: RobotAvatarProps) {
  // Size mapping
  const sizeClass = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-20 w-20",
    xl: "h-28 w-28",
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full overflow-hidden",
          sizeClass[size],
          isAnimated && "animate-float",
          isPulsing && "animate-pulse",
          className
        )}
      >
        <img
          src="/lovable-uploads/f28bd4f2-c52a-4695-94d0-1c8051d5f392.png"
          alt="AI Assistant"
          className="object-contain h-full w-full scale-[0.95]"
        />
        
        {/* Bottom shadow effect */}
        <div className="absolute -bottom-1 w-3/4 h-1 bg-black/20 rounded-full blur-sm"></div>
      </div>
      
      {/* Speech bubble */}
      {showSpeechBubble && (
        <div className={cn(
          "absolute speech-bubble bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-200 text-sm font-medium",
          size === "sm" ? "left-12 top-1 whitespace-nowrap" : 
          size === "md" ? "left-14 top-2 whitespace-nowrap" : 
          size === "lg" ? "left-24 top-4" : 
          "left-32 top-6"
        )}>
          Hi, I'm Pico
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-white border-l border-b border-gray-200"></div>
        </div>
      )}
    </div>
  );
}
