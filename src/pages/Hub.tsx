
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HubHeader } from "@/components/hub/HubHeader";
import { HubTabs } from "@/components/hub/HubTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { MembershipConfirmationDialog } from "@/components/hub/MembershipConfirmationDialog";

export default function Hub() {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch hub data
  const { data: hub, isLoading: isLoadingHub } = useQuery({
    queryKey: ['hub', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hubs')
        .select('*')
        .eq('id', hubId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!hubId && !!session,
  });

  // Fetch member status
  const { data: memberStatus } = useQuery({
    queryKey: ['hub-member-status', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_members')
        .select('role, status, confirmed')
        .eq('hub_id', hubId)
        .eq('profile_id', session?.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!hubId && !!session?.user?.id,
  });

  useEffect(() => {
    // If the user is a member but hasn't confirmed, show the confirmation dialog
    if (memberStatus && !memberStatus.confirmed) {
      setShowConfirmation(true);
    }
  }, [memberStatus]);

  if (isLoadingHub) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold">Hub not found</h1>
        <p className="text-muted-foreground mt-2">
          The hub you're looking for doesn't exist or you don't have access to it.
        </p>
        <button 
          onClick={() => navigate('/hubs')}
          className="mt-4 px-4 py-2 rounded bg-primary text-white"
        >
          Back to Hubs
        </button>
      </div>
    );
  }

  const userIsAdmin = memberStatus?.role === 'admin';

  return (
    <div className="container py-8 space-y-8">
      <HubHeader hub={hub} isAdmin={userIsAdmin} />
      <HubTabs hub={hub} isAdmin={userIsAdmin} />
      
      {/* Membership confirmation dialog */}
      <MembershipConfirmationDialog
        hubId={hubId!}
        hubName={hub.name}
        description={hub.description}
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
      />
    </div>
  );
}
