import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: "mentee" | "mentor" | "admin" | "editor";
  [key: string]: any;
}

interface ProfileContextType {
  profile: ProfileData | null;
  isLoading: boolean;
  isError: boolean;
  refetchProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchProfile = async () => {
    try {
      if (!session?.user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
      setIsError(true);
      toast({
        title: "Error fetching profile",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const refetchProfile = async () => {
    setIsLoading(true);
    await fetchProfile();
  };

  return (
    <ProfileContext.Provider value={{ profile, isLoading, isError, refetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileSession() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileSession must be used within a ProfileProvider");
  }
  return context;
}