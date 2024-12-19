import React from "react";
import { VideoData } from "@/types/video";

interface VideoPlayerProps {
  video: VideoData;
  isTransitioning: boolean;
  transitionDirection: 'up' | 'down' | null;
}

export const VideoPlayer = ({ video, isTransitioning, transitionDirection }: VideoPlayerProps) => {
  const getTransitionClass = () => {
    if (!isTransitioning) return '';
    return transitionDirection === 'up' ? '-translate-y-full' : 'translate-y-full';
  };

  return (
    <div className="relative h-full w-full">
      <video 
        key={video.id}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${getTransitionClass()}`}
        src={video.videoUrl}
        loop
        autoPlay
        muted
      />
      
      {/* Overlay Text */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-foreground text-lg font-semibold">{video.title}</h2>
        </div>
        <p className="text-muted-foreground text-sm">{video.author}</p>
      </div>
    </div>
  );
};