import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Award } from "lucide-react";
import { useState } from "react";
import { BookSessionDialog } from "./BookSessionDialog";
import { ProfileDetailsDialog } from "./ProfileDetailsDialog";
import { ProfileHeader } from "./profile-details/ProfileHeader";
import { ProfileBio } from "./profile-details/ProfileBio";
import { ProfileSkills } from "./profile-details/ProfileSkills";

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
    top_mentor?: boolean;
    position?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    tools?: string[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MentorDetailsDialog({ mentor, open, onOpenChange }: MentorDetailsDialogProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Transform mentor data to match profile format
  const profileData = {
    id: mentor.id,
    full_name: mentor.name,
    avatar_url: mentor.imageUrl,
    position: mentor.position || mentor.title,
    company_name: mentor.company,
    location: mentor.location,
    top_mentor: mentor.top_mentor,
    bio: mentor.bio,
    skills: mentor.skills || [],
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <DialogHeader className="p-6 pb-0">
            <ProfileHeader profile={profileData} />
          </DialogHeader>

          <ScrollArea className="h-[calc(85vh-120px)] px-6">
            <div className="space-y-6 pb-6">
              <ProfileBio bio={profileData.bio} />
              
              {/* Stats Section */}
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">Stats</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Mentees</p>
                    <p className="text-lg font-semibold">{mentor.stats.mentees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Connected</p>
                    <p className="text-lg font-semibold">{mentor.stats.connected}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recordings</p>
                    <p className="text-lg font-semibold">{mentor.stats.recordings}</p>
                  </div>
                </div>
              </div>

              <ProfileSkills skills={profileData.skills} tools={mentor.tools || []} />

              <div className="flex justify-center">
                <Button 
                  size="lg"
                  onClick={() => setBookingOpen(true)}
                  className="w-full md:w-auto"
                >
                  Book a Session
                </Button>
              </div>
            </div>
          </ScrollArea>
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