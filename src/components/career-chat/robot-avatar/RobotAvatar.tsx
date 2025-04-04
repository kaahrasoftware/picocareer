
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
        "relative flex items-center justify-center rounded-full bg-primary/5 overflow-hidden",
        sizeClass[size],
        isAnimated && "animate-float",
        isPulsing && "animate-pulse",
        className
      )}
    >
      <img
        src="/lovable-uploads/8530b57d-feee-4044-9bf2-49c0b52f5487.png"
        alt="AI Assistant"
        className="object-contain h-full w-full scale-[0.95]"
      />
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 opacity-50 mix-blend-overlay" />
    </div>
  );
}
