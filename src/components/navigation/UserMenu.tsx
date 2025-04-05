
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

export function UserMenu() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, signOut } = useAuthSession();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile(session);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    try {
      setIsSigningOut(true);
      await signOut();
      // Clear all cached data on signout
      queryClient.clear();
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      
      // Navigate after a slight delay to allow state updates to complete
      setTimeout(() => {
        navigate("/auth");
      }, 100);
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>;
  }

  if (!profile) return null;

  return (
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
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/profile?tab=settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
