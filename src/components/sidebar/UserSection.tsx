import { LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Session } from "@supabase/supabase-js";

interface UserSectionProps {
  session: Session | null;
  avatarUrl: string | null;
  isCollapsed: boolean;
  onSignOut: () => void;
  onProfileClick: () => void;
  onAuthClick: () => void;
}

export function UserSection({ 
  session, 
  avatarUrl, 
  isCollapsed, 
  onSignOut, 
  onProfileClick, 
  onAuthClick 
}: UserSectionProps) {
  if (session?.user) {
    return (
      <>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onProfileClick}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatarUrl || ''} alt={session.user.email || 'User'} />
              <AvatarFallback className="bg-muted">
                {session.user.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
          <div className={`flex-1 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <h3 className="text-sm font-medium truncate">{session.user.email}</h3>
            <p className="text-xs text-muted-foreground">Student</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onSignOut}
          data-sidebar="menu-button"
        >
          <div className="flex items-center justify-center w-5 min-w-[1.25rem] ml-1">
            <LogOut className="h-4 w-4" />
          </div>
          <span className={`ml-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Sign out
          </span>
        </Button>
      </>
    );
  }

  return (
    <Button
      className="w-full justify-start"
      onClick={onAuthClick}
      data-sidebar="menu-button"
    >
      <div className="flex items-center justify-center w-5 min-w-[1.25rem] ml-1">
        <LogIn className="h-4 w-4" />
      </div>
      <span className={`ml-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
        Sign in
      </span>
    </Button>
  );
}