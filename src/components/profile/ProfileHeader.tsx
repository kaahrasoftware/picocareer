import React, { useEffect, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileStats } from "./ProfileStats";
import { SkillsList } from "./SkillsList";
import { useQuery } from "@tanstack/react-query";

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  academic_major: string | null;
  school_name: string | null;
  skills: string[] | null;
}

export function ProfileHeader() {
  const [session, setSession] = useState<any>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();
      
      if (error) throw error;
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

  const skills = [
    { text: "biochemical engineering", colorClass: "bg-green-900/50 text-green-400" },
    { text: "microbiology", colorClass: "bg-indigo-900/50 text-indigo-400" },
    { text: "Bioreactor", colorClass: "bg-blue-900/50 text-blue-400" },
    { text: "Genetic engineering", colorClass: "bg-red-900/50 text-red-400" },
    { text: "GMP", colorClass: "bg-yellow-900/50 text-yellow-400" },
    { text: "MATLAB", colorClass: "bg-purple-900/50 text-purple-400" },
    { text: "AutoCAD", colorClass: "bg-gray-900/50 text-gray-400" },
    { text: "Computational modeling", colorClass: "bg-yellow-900/50 text-yellow-400" },
    { text: "Mathematical modeling", colorClass: "bg-blue-900/50 text-blue-400" },
    { text: "Engineer-in-Training", colorClass: "bg-gray-900/50 text-gray-400" },
    { text: "Six Sigma", colorClass: "bg-orange-900/50 text-orange-400" },
    { text: "Data analysis", colorClass: "bg-purple-900/50 text-purple-400" },
  ];

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
              {profile.academic_major || "No major set"}
            </DialogTitle>
            <p className="text-sm text-gray-400 dark:text-gray-400">
              {profile.school_name || "No school set"}
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

      <SkillsList skills={skills} />
    </div>
  );
}