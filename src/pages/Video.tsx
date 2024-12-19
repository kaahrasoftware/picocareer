import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoActions } from "@/components/video/VideoActions";
import { VideoData } from "@/types/video";

const VideoPage = () => {
  const videos: VideoData[] = [
    {
      id: "1",
      title: "Why Did Man United Sign Pogba?",
      author: "@pitchsidechat",
      authorAvatar: "/placeholder.svg",
      likes: 88000,
      comments: 1235,
      videoUrl: "/placeholder-video.mp4"
    },
    {
      id: "2",
      title: "The Rise of Erling Haaland",
      author: "@footballinsights",
      authorAvatar: "/placeholder.svg",
      likes: 120000,
      comments: 2100,
      videoUrl: "/placeholder-video.mp4"
    },
    {
      id: "3",
      title: "Messi's Journey to World Cup Glory",
      author: "@soccerlegends",
      authorAvatar: "/placeholder.svg",
      likes: 250000,
      comments: 5400,
      videoUrl: "/placeholder-video.mp4"
    }
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'up' | 'down' | null>(null);

  const handleNextVideo = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTransitionDirection('up');
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, 300);
  };

  const handlePreviousVideo = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTransitionDirection('down');
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, 300);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      if (isTransitioning) return;

      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        if (event.deltaY > 0) {
          handleNextVideo();
        } else if (event.deltaY < 0) {
          handlePreviousVideo();
        }
      }, 50);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(timeoutId);
    };
  }, [isTransitioning]);

  const currentVideo = videos[currentVideoIndex];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* Search Bar */}
      <div className="w-full px-8 pt-6">
        <div className="w-[280px]">
          <SearchBar placeholder="Search for videos..." />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex justify-center items-center flex-1 relative">
        {/* Navigation Buttons */}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm"
            onClick={handlePreviousVideo}
            disabled={isTransitioning}
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm"
            onClick={handleNextVideo}
            disabled={isTransitioning}
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Video Container */}
          <div className="relative w-full max-w-[350px] h-[80vh] bg-card rounded-lg overflow-hidden shadow-xl">
            <VideoPlayer 
              video={currentVideo}
              isTransitioning={isTransitioning}
              transitionDirection={transitionDirection}
            />
          </div>

          {/* Action Buttons */}
          <VideoActions video={currentVideo} />
        </div>
      </div>
    </div>
  );
};

export default VideoPage;