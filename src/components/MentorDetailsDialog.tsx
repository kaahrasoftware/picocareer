import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Star, MessageSquare, Calendar, Bookmark, Building2, GraduationCap } from "lucide-react";
import { useState } from "react";
import { BookSessionDialog } from "./BookSessionDialog";

interface MentorDetailsDialogProps {
  mentor: {
    id?: string; // Make id optional to match existing usage
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
    bio?: string;
    position?: string;
    education?: string;
    sessionsHeld?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MentorDetailsDialog({ mentor, open, onOpenChange }: MentorDetailsDialogProps) {
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-kahra-dark text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={mentor.imageUrl} alt={mentor.name} />
                <AvatarFallback>{mentor.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2>{mentor.name}</h2>
                <p className="text-base font-normal text-gray-400">@{mentor.username}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bookmark className="h-5 w-5" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Building2 size={16} />
                <span>{mentor.company}</span>
              </div>
              <h3 className="text-xl font-semibold">{mentor.title}</h3>
              {mentor.education && (
                <div className="flex items-center gap-2 text-gray-400">
                  <GraduationCap size={16} />
                  <span>{mentor.education}</span>
                </div>
              )}
            </div>

            {mentor.bio && (
              <div className="bg-kahra-darker rounded-lg p-4">
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-gray-400">{mentor.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
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
              <div className="bg-kahra-darker p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Calendar size={16} />
                  <span>Sessions</span>
                </div>
                <p className="text-xl font-semibold">{mentor.sessionsHeld || "0"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Button className="w-full" variant="default">
                <MessageSquare className="mr-2" />
                Request Chat
              </Button>
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={() => setBookingDialogOpen(true)}
              >
                <Calendar className="mr-2" />
                Book Session
              </Button>
              <Button className="w-full" variant="outline">
                <BookOpen className="mr-2" />
                View Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BookSessionDialog
        mentor={mentor}
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
      />
    </>
  );
}