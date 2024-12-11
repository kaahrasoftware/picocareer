import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { useState } from "react";
import { BookSessionDialog } from "./BookSessionDialog";
import { MentorHeader } from "./mentor/MentorHeader";
import { MentorInfo } from "./mentor/MentorInfo";
import { MentorBio } from "./mentor/MentorBio";
import { MentorSkills } from "./mentor/MentorSkills";
import { MentorStats } from "./mentor/MentorStats";
import { MentorActions } from "./mentor/MentorActions";

interface MentorDetailsDialogProps {
  mentor: {
    title: string;
    company: string;
    image_url: string;
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
    sessions_held?: string;
    skills?: string[];
    tools?: string[];
    keywords?: string[];
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
            <MentorHeader 
              name={mentor.name}
              username={mentor.username}
              imageUrl={mentor.image_url}
            />
          </DialogHeader>

          <div className="space-y-6">
            <MentorInfo 
              company={mentor.company}
              title={mentor.title}
              education={mentor.education}
            />

            <MentorBio bio={mentor.bio} />

            <MentorSkills 
              skills={mentor.skills}
              tools={mentor.tools}
            />

            <MentorStats 
              stats={mentor.stats}
              sessions_held={mentor.sessions_held}
            />

            <MentorActions 
              onBookSession={() => setBookingDialogOpen(true)}
            />
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