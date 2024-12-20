import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

export function MenuSidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50">
      <div className="container h-full mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img 
              src="/lovable-uploads/2b1bee0a-4952-41f3-8220-963b51130b04.png" 
              alt="PicoCareer Logo" 
              className="h-10"
            />
          </Link>
        </div>

        <nav className="flex-1 flex justify-center">
          <ul className="flex gap-8">
            <li>
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/career" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Careers
              </Link>
            </li>
            <li>
              <Link 
                to="/program" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Programs
              </Link>
            </li>
            <li>
              <Link 
                to="/mentor" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Find a Mentor
              </Link>
            </li>
            <li>
              <Link 
                to="/blog" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link 
                to="/video" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Videos
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-picocareer-primary to-picocareer-secondary" />
                  <div className="absolute inset-[3px] rounded-full bg-background" />
                  <Avatar className="h-10 w-10 relative">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user.email || ''} />
                    <AvatarFallback>{profile?.full_name?.[0] || user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              onClick={() => navigate("/auth")}
              className="bg-picocareer-primary hover:bg-picocareer-primary/90"
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}