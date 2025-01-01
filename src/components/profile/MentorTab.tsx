import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { SessionTypeManager } from "./mentor/SessionTypeManager";
import { AvailabilityManager } from "./mentor/AvailabilityManager";
import { MentorshipStats } from "./mentor/MentorshipStats";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMentorStats } from "./mentor/hooks/useMentorStats";

interface MentorTabProps {
  profileId: string;
}

export function MentorTab({ profileId }: MentorTabProps) {
  const { toast } = useToast();
  const { stats, refetchSessions } = useMentorStats(profileId);

  const { refetch: refetchSessionTypes } = useQuery({
    queryKey: ['session-types', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', profileId);

      if (error) {
        console.error('Error fetching session types:', error);
        toast({
          title: "Error",
          description: "Failed to fetch session types",
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
  });

  if (!stats) {
    return null; // Or a loading state
  }

  return (
    <Tabs defaultValue="stats" className="w-full">
      <TabsContent value="stats">
        <MentorshipStats stats={stats} />
      </TabsContent>

      <TabsContent value="session-types">
        <SessionTypeManager 
          profileId={profileId} 
          onUpdate={refetchSessionTypes}
        />
      </TabsContent>

      <TabsContent value="availability">
        <AvailabilityManager 
          profileId={profileId} 
          onUpdate={refetchSessionTypes}
        />
      </TabsContent>
    </Tabs>
  );
}