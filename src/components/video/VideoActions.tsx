import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { VideoData } from "@/types/video";

interface VideoActionsProps {
  video: VideoData;
}

export const VideoActions = ({ video }: VideoActionsProps) => {
  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex flex-col items-center gap-0.5">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm">
          <ThumbsUp className="h-5 w-5 text-primary" />
        </Button>
        <span className="text-foreground text-xs">{video.likes > 1000 ? `${Math.floor(video.likes/1000)}K` : video.likes}</span>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm">
          <ThumbsDown className="h-5 w-5 text-primary" />
        </Button>
        <span className="text-foreground text-xs">Dislike</span>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm">
          <MessageCircle className="h-5 w-5 text-primary" />
        </Button>
        <span className="text-foreground text-xs">{video.comments}</span>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm">
          <Share2 className="h-5 w-5 text-primary" />
        </Button>
        <span className="text-foreground text-xs">Share</span>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm">
          <MoreVertical className="h-5 w-5 text-primary" />
        </Button>
      </div>

      <Avatar className="h-10 w-10 ring-2 ring-background/20 shadow-lg mt-4">
        <AvatarImage src={video.authorAvatar} alt={video.author} />
        <AvatarFallback>{video.author[0]}</AvatarFallback>
      </Avatar>
    </div>
  );
};