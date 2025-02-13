
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Hub } from "@/types/database/hubs";
import { Button } from "@/components/ui/button";
import { HubHeader } from "@/components/hub/HubHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/hooks/useAuthSession";
import { HubTabs } from "@/components/hub/HubTabs";

export default function Hub() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuthSession();
  const isValidUUID = id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : false;

  const { data: memberData, isLoading: isMemberLoading } = useQuery({
    queryKey: ['hub-member-role', id, session?.user?.id],
    queryFn: async () => {
      if (!id || !session?.user?.id) return null;
      
      console.log('Fetching member data for:', {
        hubId: id,
        userId: session.user.id
      });

      const { data, error } = await supabase
        .from('hub_members')
        .select('role, status')
        .eq('hub_id', id)
        .eq('profile_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking hub membership:', error);
        throw error;
      }

      console.log('Member data result:', data);
      return data;
    },
    enabled: !!id && !!session?.user?.id && isValidUUID,
  });

  // Update member status checks
  const isAdmin = memberData?.role === 'admin';
  const isModerator = memberData?.role === 'moderator';
  // Only consider approved members as members
  const isMember = memberData?.status === 'Approved';

  console.log('Membership status:', {
    memberData,
    isAdmin,
    isModerator,
    isMember
  });

  const { data: hub, isLoading: hubLoading, error: hubError } = useQuery({
    queryKey: ['hub', id],
    queryFn: async () => {
      if (!isValidUUID) {
        throw new Error('Invalid hub ID');
      }

      const { data, error } = await supabase
        .from('hubs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching hub:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Hub not found');
      }

      return data as Hub;
    },
    enabled: !!id && isValidUUID,
    retry: 1,
  });

  const { data: hubStats, isLoading: statsLoading } = useQuery({
    queryKey: ['hub-stats', id],
    queryFn: async () => {
      if (!id) return null;

      const { count: membersCount } = await supabase
        .from('hub_members')
        .select('*', { count: 'exact', head: true })
        .eq('hub_id', id)
        .eq('status', 'Approved');

      const { count: resourcesCount } = await supabase
        .from('hub_resources')
        .select('*', { count: 'exact', head: true })
        .eq('hub_id', id);

      return {
        membersCount: membersCount || 0,
        resourcesCount: resourcesCount || 0
      };
    },
    enabled: !!id && !hubError,
  });

  if (!id || !isValidUUID) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Hub ID</h1>
        <p className="text-muted-foreground mb-4">
          The hub ID provided is not valid.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  if (hubLoading || statsLoading || isMemberLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (hubError || !hub) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Hub not found</h1>
        <p className="text-muted-foreground mb-4">
          The hub you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <HubHeader hub={hub} />
      <HubTabs 
        hub={hub}
        isMember={isMember}
        isAdmin={isAdmin}
        isModerator={isModerator}
        hubStats={hubStats}
      />
    </div>
  );
}
