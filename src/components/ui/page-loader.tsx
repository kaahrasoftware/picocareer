
import React from 'react';
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
}

export function PageLoader({ 
  className, 
  size = "md", 
  fullScreen = false,
  text
}: PageLoaderProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const containerClass = fullScreen 
    ? "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" 
    : "flex flex-col items-center justify-center py-12";

  return (
    <div className={cn(containerClass, className)}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className={cn("animate-spin text-primary", sizeClass[size])} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}
