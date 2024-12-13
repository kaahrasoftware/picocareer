import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Users, Star, Building2, GraduationCap } from "lucide-react";
import { useState } from "react";
import { BookSessionDialog } from "./BookSessionDialog";
import { ProfileDetailsDialog } from "./ProfileDetailsDialog";

interface MentorDetailsDialogProps {
  mentor: {
    id: string;
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
  const [bookingOpen, setBookingOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={mentor.imageUrl} alt={mentor.name} />
                <AvatarFallback>{mentor.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{mentor.name}</h2>
                  <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                    mentor
                  </Badge>
                </div>
                <p className="text-base font-normal text-muted-foreground">@{mentor.username}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-1">{mentor.title}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 size={16} />
                <span>{mentor.company}</span>
              </div>
            </div>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{mentor.stats.mentees} mentees</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} />
                <span>{mentor.stats.connected} connected</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>{mentor.stats.recordings} recordings</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                className="flex-1"
                onClick={() => setBookingOpen(true)}
              >
                Book a Session
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setProfileOpen(true)}
              >
                View Full Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BookSessionDialog
        mentor={{
          id: mentor.id,
          name: mentor.name,
          imageUrl: mentor.imageUrl
        }}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />

      <ProfileDetailsDialog
        userId={mentor.id}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </>
  );
}