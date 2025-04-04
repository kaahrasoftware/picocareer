
import React from "react";
import { cn } from "@/lib/utils";

interface RobotAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
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
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-primary/10 overflow-hidden",
        sizeClass[size],
        isAnimated && "animate-float",
        isPulsing && "animate-pulse",
        className
      )}
    >
      <img
        src="/lovable-uploads/1d7756ef-34d7-41dc-92a9-67e9216e0d7b.png"
        alt="AI Robot Assistant"
        className="object-contain h-full w-full scale-[0.85]"
      />
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50 mix-blend-overlay" />
    </div>
  );
}
