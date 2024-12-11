import { Button } from "@/components/ui/button";
import { LogIn, User } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { AuthDialog } from "./AuthDialog";
import { ProfileDialog } from "./ProfileDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/integrations/supabase/types/user.types";

export function SidebarFooter() {
  const session = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: userData } = useQuery<UserType>({
    queryKey: ['user', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', session.user.id)
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('No user data found');
      
      // Convert stats from JSON to UserStats type
      const stats = typeof data.stats === 'string' 
        ? JSON.parse(data.stats)
        : data.stats;

      return {
        ...data,
        stats
      } as UserType;
    },
    enabled: !!session?.user?.id
  });

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
              <span className="text-sm font-medium">{userData?.name || 'loading...'}</span>
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