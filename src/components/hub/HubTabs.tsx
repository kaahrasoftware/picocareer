
import { Hub } from "@/types/database/hubs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HubResources } from "./HubResources";
import { HubAnnouncements } from "./HubAnnouncements";
import { HubMembers } from "./HubMembers";
import { HubDepartments } from "./HubDepartments";
import { HubManagement } from "./management/HubManagement";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { HubOverviewSection } from "./overview/HubOverviewSection";
import { HubChat } from "./chat/HubChat";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HubTabsProps {
  hub: Hub;
  isAdmin: boolean;
}

export function HubTabs({
  hub,
  isAdmin,
}: HubTabsProps) {
  const { session } = useAuthSession();
  
  // Fetch membership status
  const { data: memberStatus } = useQuery({
    queryKey: ['hub-member-status', hub.id, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('hub_members')
        .select('role, status, confirmed')
        .eq('hub_id', hub.id)
        .eq('profile_id', session?.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!hub.id && !!session?.user?.id,
  });
  
  const isMember = !!memberStatus && memberStatus.status === 'Approved';
  const isModerator = isMember && memberStatus.role === 'moderator';
  
  // Get hub statistics
  const { data: hubStats } = useQuery({
    queryKey: ['hub-stats', hub.id],
    queryFn: async () => {
      const { data: members, error: membersError } = await supabase
        .from('hub_members')
        .select('id')
        .eq('hub_id', hub.id)
        .eq('status', 'Approved');
        
      const { data: resources, error: resourcesError } = await supabase
        .from('hub_resources')
        .select('id')
        .eq('hub_id', hub.id);
      
      if (membersError || resourcesError) return null;
      
      return {
        membersCount: members?.length || 0,
        resourcesCount: resources?.length || 0
      };
    },
    enabled: !!hub.id,
  });

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        {session && <TabsTrigger value="chat">Channels</TabsTrigger>}
        {isMember && (
          <>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="departments">Communities</TabsTrigger>
          </>
        )}
        {isAdmin && <TabsTrigger value="manage">Manage</TabsTrigger>}
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <HubOverviewSection hub={hub} hubStats={hubStats} />
        {!isMember && (
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Join this hub to access announcements, resources, members list, and departments.
            </AlertDescription>
          </Alert>
        )}
      </TabsContent>

      {session && (
        <TabsContent value="chat" className="mt-6">
          {!isMember && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You can participate in public chat rooms. Join this hub to access private chat rooms as well.
              </AlertDescription>
            </Alert>
          )}
          <HubChat hubId={hub.id} isAdmin={isAdmin} isModerator={isModerator} />
        </TabsContent>
      )}

      {isMember && (
        <>
          <TabsContent value="announcements" className="mt-6">
            <HubAnnouncements hubId={hub.id} isAdmin={isAdmin} isModerator={isModerator} />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <HubResources hubId={hub.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <HubMembers hubId={hub.id} />
          </TabsContent>

          <TabsContent value="departments" className="mt-6">
            <HubDepartments hubId={hub.id} isAdmin={isAdmin} isModerator={isModerator} />
          </TabsContent>
        </>
      )}

      {isAdmin && (
        <TabsContent value="manage" className="mt-6">
          <HubManagement hub={hub} />
        </TabsContent>
      )}
    </Tabs>
  );
}
