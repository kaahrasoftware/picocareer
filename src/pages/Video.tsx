import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical, ChevronUp, ChevronDown } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface VideoData {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  likes: number;
  comments: number;
  videoUrl: string;
}

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

  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  const handlePreviousVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  // Add wheel event handler
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Prevent default scrolling behavior
      event.preventDefault();
      
      // Scroll up (negative deltaY) -> next video
      // Scroll down (positive deltaY) -> previous video
      if (event.deltaY < 0) {
        handleNextVideo();
      } else if (event.deltaY > 0) {
        handlePreviousVideo();
      }
    };

    // Add event listener to the window
    window.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

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
            className="rounded-full bg-picocareer-primary/20 hover:bg-picocareer-primary/40 backdrop-blur-sm text-picocareer-dark"
            onClick={handlePreviousVideo}
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-picocareer-primary/20 hover:bg-picocareer-primary/40 backdrop-blur-sm text-picocareer-dark"
            onClick={handleNextVideo}
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Video Container */}
          <div className="relative w-full max-w-[350px] h-[80vh] bg-card rounded-lg overflow-hidden shadow-xl">
            {/* Video Content */}
            <div className="relative h-full">
              <video 
                key={currentVideo.id}
                className="w-full h-full object-cover"
                src={currentVideo.videoUrl}
                loop
                autoPlay
                muted
              />
              
              {/* Overlay Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-foreground text-lg font-semibold">{currentVideo.title}</h2>
                </div>
                <p className="text-muted-foreground text-sm">{currentVideo.author}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-col items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm">
                <ThumbsUp className="h-5 w-5 text-primary" />
              </Button>
              <span className="text-foreground text-xs">{currentVideo.likes > 1000 ? `${Math.floor(currentVideo.likes/1000)}K` : currentVideo.likes}</span>
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
              <span className="text-foreground text-xs">{currentVideo.comments}</span>
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
              <AvatarImage src={currentVideo.authorAvatar} alt={currentVideo.author} />
              <AvatarFallback>{currentVideo.author[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;