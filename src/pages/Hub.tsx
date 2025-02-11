
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Hub } from "@/types/database/hubs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HubHeader } from "@/components/hub/HubHeader";
import { HubResources } from "@/components/hub/HubResources";
import { HubAnnouncements } from "@/components/hub/HubAnnouncements";
import { HubMembers } from "@/components/hub/HubMembers";
import { HubDepartments } from "@/components/hub/HubDepartments";
import { Skeleton } from "@/components/ui/skeleton";

export default function Hub() {
  const { id } = useParams<{ id: string }>();
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');

  const { data: hub, isLoading: hubLoading } = useQuery({
    queryKey: ['hub', id],
    queryFn: async () => {
      if (!isValidUUID) {
        throw new Error('Invalid hub ID');
      }

      const { data, error } = await supabase
        .from('hubs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Hub;
    },
    enabled: !!id && isValidUUID,
  });

  // Check if user is a member
  const { data: isMember, isLoading: membershipLoading } = useQuery({
    queryKey: ['hub-membership', id],
    queryFn: async () => {
      if (!id) return false;

      const { data, error } = await supabase
        .from('hub_members')
        .select('status')
        .eq('hub_id', id)
        .eq('status', 'Approved')
        .maybeSingle();

      if (error) {
        console.error('Error checking membership:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!id,
  });

  if (hubLoading || membershipLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Hub not found</h1>
        <p className="text-muted-foreground mb-4">
          The hub you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <HubHeader hub={hub} />
      
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          {isMember && (
            <>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="announcements" className="mt-6">
          <HubAnnouncements hubId={hub.id} />
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <HubResources hubId={hub.id} />
        </TabsContent>

        {isMember && (
          <>
            <TabsContent value="members" className="mt-6">
              <HubMembers hubId={hub.id} />
            </TabsContent>

            <TabsContent value="departments" className="mt-6">
              <HubDepartments hubId={hub.id} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
