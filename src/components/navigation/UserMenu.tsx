import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, User, Bookmark, GraduationCap, Settings, Wallet } from "lucide-react";
import { useMobileMenu } from "@/context/MobileMenuContext";
import { WalletDialog } from "@/components/wallet/WalletDialog";

export function UserMenu() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, signOut } = useAuthSession();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile(session);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const { closeMobileMenu } = useMobileMenu();

  const handleNavigate = (path: string) => {
    navigate(path);
    closeMobileMenu(); // Close mobile menu when navigating
  };

  const handleWalletClick = () => {
    setIsWalletDialogOpen(true);
    closeMobileMenu();
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    try {
      setIsSigningOut(true);
      console.log('User menu: signing out');
      
      // Clear all cached data on signout immediately for better UX
      queryClient.clear();
      
      await signOut();
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      
      // Close mobile menu before navigating
      closeMobileMenu();
      
      // Navigate after signing out
      navigate("/auth");
      
    } catch (error: any) {
      console.error('Error in UserMenu sign out:', error);
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      });
      
      // If there was an error, force a hard reload as fallback
      if (error.message?.includes('network') || error.message?.includes('timeout')) {
        window.location.href = "/auth";
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>;
  }

  if (!profile) return null;

  const isMentor = profile.user_type === 'mentor';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="outline-none" data-testid="user-menu-button">
            <ProfileAvatar
              avatarUrl={profile.avatar_url}
              imageAlt={profile.full_name || profile.email}
              size="sm"
              userId={profile.id}
              editable={false}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="truncate max-w-[95%]">
              {profile.full_name || profile.email}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-[95%]">
              {profile.email}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleNavigate("/profile")} 
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigate("/profile?tab=calendar")} 
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleWalletClick} 
            className="flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            Wallet
          </DropdownMenuItem>
          {isMentor && (
            <DropdownMenuItem 
              onClick={() => handleNavigate("/profile?tab=mentor")} 
              className="flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Mentor
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={() => handleNavigate("/profile?tab=bookmarks")} 
            className="flex items-center gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Bookmarks
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigate("/profile?tab=settings")} 
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={isSigningOut ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <WalletDialog 
        open={isWalletDialogOpen} 
        onOpenChange={setIsWalletDialogOpen}
        profileId={profile.id}
      />
    </>
  );
}
