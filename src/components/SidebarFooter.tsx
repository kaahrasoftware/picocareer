import { Button } from "@/components/ui/button";
import { LogIn, User } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { AuthDialog } from "./AuthDialog";
import { ProfileDialog } from "./ProfileDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function SidebarFooter() {
  const session = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (session) {
    return (
      <>
        <div className="mt-auto p-6 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-start gap-3 text-primary hover:text-primary/90 hover:bg-primary/10"
            onClick={() => setProfileOpen(true)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`} 
                alt="Profile" 
              />
              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{session.user.email}</span>
              <span className="text-xs text-muted-foreground">View Profile</span>
            </div>
          </Button>
        </div>
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      </>
    );
  }

  return (
    <>
      <div className="mt-auto p-6 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-primary hover:text-primary/90 hover:bg-primary/10"
          onClick={() => setAuthOpen(true)}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>
      </div>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}