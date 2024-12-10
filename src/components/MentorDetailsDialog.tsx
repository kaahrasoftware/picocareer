import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Star } from "lucide-react";

interface MentorDetailsDialogProps {
  mentor: {
    title: string;
    company: string;
    imageUrl: string;
    name: string;
    stats: {
      mentees: string;
      connected: string;
      recordings: string;
    };
    username: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MentorDetailsDialog({ mentor, open, onOpenChange }: MentorDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-kahra-dark text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mentor.imageUrl} alt={mentor.name} />
              <AvatarFallback>{mentor.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2>{mentor.name}</h2>
              <p className="text-base font-normal text-gray-400">@{mentor.username}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">{mentor.title}</h3>
            <p className="text-gray-400">{mentor.company}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-kahra-darker p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Users size={16} />
                <span>Mentees</span>
              </div>
              <p className="text-xl font-semibold">{mentor.stats.mentees}</p>
            </div>
            <div className="bg-kahra-darker p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Star size={16} />
                <span>Connected</span>
              </div>
              <p className="text-xl font-semibold">{mentor.stats.connected}</p>
            </div>
            <div className="bg-kahra-darker p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <BookOpen size={16} />
                <span>Recordings</span>
              </div>
              <p className="text-xl font-semibold">{mentor.stats.recordings}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="flex-1" variant="default">View Profile</Button>
            <Button className="flex-1" variant="secondary">Book Meeting</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}