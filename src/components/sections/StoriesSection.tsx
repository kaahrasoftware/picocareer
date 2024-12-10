import { Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const stories = [
  {
    id: 1,
    username: "Your Story",
    imageUrl: "/placeholder.svg",
    isUser: true,
  },
  {
    id: 2,
    username: "anagrantor",
    imageUrl: "/placeholder.svg",
  },
  {
    id: 3,
    username: "rick_barth",
    imageUrl: "/placeholder.svg",
  },
  {
    id: 4,
    username: "zephick",
    imageUrl: "/placeholder.svg",
  },
  {
    id: 5,
    username: "jane_doe",
    imageUrl: "/placeholder.svg",
  },
];

export const StoriesSection = () => {
  return (
    <section className="mb-12">
      <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center space-y-2">
            <div className="relative cursor-pointer group">
              {story.isUser && (
                <div className="absolute -right-1 -bottom-1 z-10 bg-kahra-primary rounded-full p-1">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-kahra-secondary to-kahra-primary">
                <Avatar className="w-14 h-14 border-2 border-background">
                  <AvatarImage src={story.imageUrl} alt={story.username} />
                  <AvatarFallback>{story.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{story.username}</span>
          </div>
        ))}
      </div>
    </section>
  );
}