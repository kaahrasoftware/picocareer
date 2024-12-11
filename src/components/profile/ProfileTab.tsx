import React from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { User, UserStats } from "@/integrations/supabase/types/user.types";

export function ProfileTab() {
  const session = useSession();

  const { data: userData, isLoading } = useQuery<User>({
    queryKey: ['user', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', session.user.id)
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }
      
      if (!data) throw new Error('No user data found');

      // Convert stats from JSON to UserStats type
      const stats: UserStats = typeof data.stats === 'string' 
        ? JSON.parse(data.stats)
        : data.stats;

      return {
        ...data,
        stats
      } as User;
    },
    enabled: !!session?.user?.id
  });

  if (isLoading) {
    return (
      <div className="space-y-6 px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-48" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!userData) {
    return <div className="px-2 text-muted-foreground">No profile data available.</div>;
  }

  const profileFields = [
    { label: "User Type", value: userData.user_type || "Not specified" },
    { label: "Name", value: userData.name },
    { label: "Username", value: userData.username },
    { label: "Title", value: userData.title },
    { label: "Company", value: userData.company },
    { label: "Position", value: userData.position || "Not specified" },
    { label: "Education", value: userData.education || "Not specified" },
    { label: "Bio", value: userData.bio || "No bio provided" },
    { label: "Sessions Held", value: userData.sessions_held || "0" },
  ];

  return (
    <div className="space-y-6 px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profileFields.map((field, index) => (
          <div key={index} className="space-y-2">
            <p className="text-gray-400 dark:text-gray-400">{field.label}:</p>
            <p className="break-words">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}