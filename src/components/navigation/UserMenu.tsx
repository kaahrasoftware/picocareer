import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Profile {
  avatar_url: string | null;
  full_name: string | null;
}

interface UserMenuProps {
  session: any;
  profile: Profile | null;
  onSignOut: () => void;
}

export function UserMenu({ session, profile, onSignOut }: UserMenuProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 border-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-picocareer-primary to-picocareer-secondary" />
          <div className="absolute inset-[3px] rounded-full bg-background" />
          <Avatar className="h-10 w-10 relative">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || session.user.email || ''} />
            <AvatarFallback>{profile?.full_name?.[0] || session.user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}