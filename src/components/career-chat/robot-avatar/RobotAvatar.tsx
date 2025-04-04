
import React from "react";
import { cn } from "@/lib/utils";

interface RobotAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl"; // Added "xl" size option
  isAnimated?: boolean;
  isPulsing?: boolean;
}

export function RobotAvatar({
  className,
  size = "md",
  isAnimated = true,
  isPulsing = false,
}: RobotAvatarProps) {
  // Size mapping - increased all sizes and added xl
  const sizeClass = {
    sm: "h-10 w-10", // Increased from h-8 w-8
    md: "h-12 w-12", // Increased from h-10 w-10
    lg: "h-20 w-20", // Increased from h-16 w-16
    xl: "h-28 w-28", // New larger size
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-primary/5 overflow-hidden",
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
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-50 mix-blend-overlay" />
    </div>
  );
}
