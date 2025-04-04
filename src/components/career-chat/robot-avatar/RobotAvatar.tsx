
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
  // Size mapping - making sizes twice as big
  const sizeClass = {
    sm: "h-20 w-20", // was h-10 w-10
    md: "h-24 w-24", // was h-12 w-12
    lg: "h-40 w-40", // was h-20 w-20
    xl: "h-56 w-56", // was h-28 w-28
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
      
      {/* Cute cloud-like speech bubble with entrance animation - moved lower */}
      {showSpeechBubble && (
        <div className={cn(
          "absolute speech-bubble bg-white px-4 py-2.5 rounded-2xl shadow-md border border-blue-100 text-sm font-medium whitespace-nowrap",
          "before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:border-b before:border-l before:border-blue-100 before:rotate-45 before:-left-2 before:top-1/2 before:-translate-y-1/2",
          "animate-[fadeIn_0.5s_ease-out,popIn_0.5s_ease-out]",
          size === "sm" ? "-right-2 top-6" : 
          size === "md" ? "-right-3 top-8" : 
          size === "lg" ? "-right-5 top-12" : 
          "-right-8 top-16"
        )}>
          <span className="font-bold text-black">Hi, I'm Pico!</span>
        </div>
      )}
    </div>
  );
}
