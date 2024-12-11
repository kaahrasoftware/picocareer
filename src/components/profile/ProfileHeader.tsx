import React, { useEffect, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileStats } from "./ProfileStats";
import { SkillsList } from "./SkillsList";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  academic_major: string | null;
  school_name: string | null;
  position: string | null;
  company_name: string | null;
  skills: string[] | null;
}

export function ProfileHeader() {
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .maybeSingle();
      
      if (error) {
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      if (!data) {
        toast({
          title: "Profile not found",
          description: "Please try signing out and signing in again.",
          variant: "destructive",
        });
        return null;
      }

      return data as Profile;
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading || !profile) {
    return (
      <div className="bg-background/80 backdrop-blur-sm border-b border-border p-3 dark:bg-kahra-darker/80">
        <div className="animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-16 h-16 bg-gray-300 rounded-full" />
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-300 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine primary and secondary display text
  const primaryText = profile.position || profile.academic_major || "No position/major set";
  const secondaryText = profile.position 
    ? profile.company_name || "No company set"
    : profile.school_name || "No school set";

  return (
    <div className="bg-background/80 backdrop-blur-sm border-b border-border p-3 dark:bg-kahra-darker/80">
      <div className="flex items-start gap-3 mb-3">
        <ProfileAvatar 
          avatarUrl={profile.avatar_url}
          userId={profile.id}
          onAvatarUpdate={(url) => profile.avatar_url = url}
        />
        <div className="flex flex-col gap-1">
          <div>
            <DialogTitle className="text-xl font-bold">
              {primaryText}
            </DialogTitle>
            <p className="text-sm text-gray-400 dark:text-gray-400">
              {secondaryText}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{profile.full_name}</h3>
            <p className="text-sm text-gray-400 dark:text-gray-400">@{profile.username}</p>
          </div>
        </div>
      </div>
      
      <ProfileStats 
        menteeCount={0}
        connectionCount={495}
        recordingCount={35}
      />

      <SkillsList />
    </div>
  );
}