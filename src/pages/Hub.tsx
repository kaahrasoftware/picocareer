
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Hub } from "@/types/database/hubs";
import { Button } from "@/components/ui/button";
import { HubHeader } from "@/components/hub/HubHeader";
import { useAuthSession } from "@/hooks/useAuthSession";
import { HubTabs } from "@/components/hub/HubTabs";
import { MembershipConfirmationDialog } from "@/components/hub/MembershipConfirmationDialog";
import { PageLoader } from "@/components/ui/page-loader";
import { useLoading } from "@/context/LoadingContext";

export default function Hub() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuthSession();
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const isValidUUID = id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : false;
  const { updateProgress } = useLoading();

  const { data: memberData, isLoading: isMemberLoading } = useQuery({
    queryKey: ['hub-member-role', id, session?.user?.id],
    queryFn: async () => {
      if (!id || !session?.user?.id) return null;
      updateProgress(33, 'Checking membership status...');
      const { data, error } = await supabase
        .from('hub_members')
        .select('role, status, confirmed')
        .eq('hub_id', id)
        .eq('profile_id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking hub membership:', error);
      }
      return data;
    },
    enabled: !!id && !!session?.user?.id && isValidUUID,
  });

  const isAdmin = memberData?.role === 'admin' && memberData?.confirmed;
  const isModerator = memberData?.role === 'moderator' && memberData?.confirmed;
  const isMember = memberData?.status === 'Approved' && memberData?.confirmed;
  const isUnconfirmedMember = memberData?.status === 'Approved' && !memberData?.confirmed;

  const { data: hub, isLoading: hubLoading, error: hubError } = useQuery({
    queryKey: ['hub', id],
    queryFn: async () => {
      if (!isValidUUID) {
        throw new Error('Invalid hub ID');
      }
      
      updateProgress(66, 'Loading hub details...');
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

      // Convert data to the expected Hub type
      return data as unknown as Hub;
    },
    enabled: !!id && isValidUUID,
    retry: 1, // Only retry once for not found errors
  });

  // Check for unconfirmed membership and show dialog
  useEffect(() => {
    if (isUnconfirmedMember && hub) {
      setShowConfirmationDialog(true);
    }
  }, [isUnconfirmedMember, hub]);

  const { data: hubStats, isLoading: statsLoading } = useQuery({
    queryKey: ['hub-stats', id],
    queryFn: async () => {
      if (!id) return null;
      
      updateProgress(100, 'Loading hub statistics...');
      const membersCount = await supabase
        .from('hub_members')
        .select('id', { count: 'exact', head: true })
        .eq('hub_id', id)
        .eq('status', 'Approved')
        .eq('confirmed', true);

      const resourcesCount = await supabase
        .from('hub_resources')
        .select('id', { count: 'exact', head: true })
        .eq('hub_id', id);

      return {
        membersCount: membersCount.count || 0,
        resourcesCount: resourcesCount.count || 0
      };
    },
    enabled: !!id && !hubError, // Only fetch stats if hub exists
  });

  const isLoading = hubLoading || statsLoading || isMemberLoading;

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <PageLoader isLoading={true} variant="default" />
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
        isUnconfirmedMember={isUnconfirmedMember}
        hubStats={hubStats}
      />
      
      {hub && (
        <MembershipConfirmationDialog 
          isOpen={showConfirmationDialog}
          onClose={() => setShowConfirmationDialog(false)}
          hubId={hub.id}
          hubName={hub.name}
        />
      )}
    </div>
  );
}
