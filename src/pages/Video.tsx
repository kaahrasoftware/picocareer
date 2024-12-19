import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical } from "lucide-react";

interface VideoStats {
  likes: number;
  comments: number;
}

const VideoPage = () => {
  const videoStats: VideoStats = {
    likes: 88000,
    comments: 1235
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="relative w-full max-w-[400px] h-[calc(100vh-4rem)] bg-gray-900 rounded-lg overflow-hidden">
        {/* Video Content */}
        <div className="relative h-full">
          <video 
            className="w-full h-full object-cover"
            src="/placeholder-video.mp4"
            loop
            autoPlay
            muted
          />
          
          {/* Overlay Text */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h2 className="text-white text-lg font-semibold mb-2">Why Did Man United Sign Pogba?</h2>
            <p className="text-gray-300 text-sm">@pitchsidechat</p>
          </div>

          {/* Right Side Actions */}
          <div className="absolute right-4 bottom-20 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800/50 hover:bg-gray-700/50">
                <ThumbsUp className="h-6 w-6 text-white" />
              </Button>
              <span className="text-white text-sm">{videoStats.likes > 1000 ? `${Math.floor(videoStats.likes/1000)}K` : videoStats.likes}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800/50 hover:bg-gray-700/50">
                <ThumbsDown className="h-6 w-6 text-white" />
              </Button>
              <span className="text-white text-sm">Dislike</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800/50 hover:bg-gray-700/50">
                <MessageCircle className="h-6 w-6 text-white" />
              </Button>
              <span className="text-white text-sm">{videoStats.comments}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800/50 hover:bg-gray-700/50">
                <Share2 className="h-6 w-6 text-white" />
              </Button>
              <span className="text-white text-sm">Share</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800/50 hover:bg-gray-700/50">
                <MoreVertical className="h-6 w-6 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;