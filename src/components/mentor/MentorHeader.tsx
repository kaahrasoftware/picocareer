import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

interface MentorHeaderProps {
  name: string;
  username: string;
  image_url: string;
}

export function MentorHeader({ name, username, image_url }: MentorHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={image_url} alt={name} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="text-base font-normal text-gray-400">@{username}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Bookmark className="h-5 w-5" />
      </Button>
    </div>
  );
}