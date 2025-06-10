
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
import { useState } from "react";
import { Calendar, User, Bookmark, GraduationCap, Settings, Wallet } from "lucide-react";
import { useMobileMenu } from "@/context/MobileMenuContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMenu() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, signOut } = useAuthSession();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile(session);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { closeMobileMenu } = useMobileMenu();

  const handleNavigate = (path: string) => {
    navigate(path);
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

  // Don't render anything if no session
  if (!session?.user) {
    return null;
  }

  // Use profile data if available, otherwise fall back to session data
  const displayName = profile?.full_name || session.user.email || 'User';
  const displayEmail = profile?.email || session.user.email || '';
  const avatarUrl = profile?.avatar_url || session.user.user_metadata?.avatar_url;
  const userType = profile?.user_type;

  const isMentor = userType === 'mentor';
  const isAdmin = userType === 'admin';

  // Get initials for fallback
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none" data-testid="user-menu-button">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="truncate max-w-[95%]">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-[95%]">
            {displayEmail}
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
        {isAdmin && (
          <DropdownMenuItem 
            onClick={() => handleNavigate("/profile?tab=wallet")} 
            className="flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            Wallet
          </DropdownMenuItem>
        )}
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
  );
}
