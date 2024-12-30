import { DialogHeader as ShadcnDialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { ProfileHeader } from "./ProfileHeader";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface DialogHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  isMentor: boolean;
  onBookSession: () => void;
}

export function DialogHeader({ profile, isOwnProfile, isMentor, onBookSession }: DialogHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/mentor?profile=${profile.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.full_name}'s Profile`,
          text: `Check out ${profile?.full_name}'s mentor profile on PicoCareer!`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Profile link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Sharing failed",
        description: "There was an error sharing this profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <ShadcnDialogHeader className="p-6 pb-0">
      <div className="relative">
        <ProfileHeader profile={profile} />
        <div className="absolute right-0 top-16 flex gap-2">
          {isMentor && (
            isOwnProfile ? (
              <Button 
                size="lg"
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </Button>
            ) : (
              <Button 
                size="lg"
                onClick={onBookSession}
              >
                Book a Session
              </Button>
            )
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </ShadcnDialogHeader>
  );
}