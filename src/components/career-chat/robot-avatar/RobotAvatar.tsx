
import React from "react";
import { cn } from "@/lib/utils";

interface RobotAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl"; 
  isAnimated?: boolean;
  isPulsing?: boolean;
}

export function RobotAvatar({
  className,
  size = "md",
  isAnimated = true,
  isPulsing = false,
}: RobotAvatarProps) {
  // Size mapping
  const sizeClass = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-20 w-20",
    xl: "h-28 w-28",
  };

  return (
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
      {/* Removed the background gradient overlay */}
    </div>
  );
}
