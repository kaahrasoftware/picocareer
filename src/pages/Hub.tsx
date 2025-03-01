
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HubHeader } from "@/components/hub/HubHeader";
import { HubTabs } from "@/components/hub/HubTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { MembershipConfirmationDialog } from "@/components/hub/MembershipConfirmationDialog";
import { Hub as HubType } from "@/types/database/hubs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Hub() {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch hub data - enabled even without session to show public info
  const { data: hub, isLoading: isLoadingHub, error: hubError } = useQuery({
    queryKey: ['hub', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hubs')
        .select('*')
        .eq('id', hubId)
        .single();

      if (error) throw error;
      return data as HubType;
    },
    enabled: !!hubId,
  });

  // Fetch member status - only enabled with session
  const { data: memberStatus } = useQuery({
    queryKey: ['hub-member-status', hubId, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
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

  // Show loading state
  if (isLoadingHub) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Hub not found or not approved
  if (!hub || hub.status !== 'Approved') {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {hubError ? 'An error occurred when loading this hub.' : 'This hub does not exist or is not yet approved.'}
          </AlertDescription>
        </Alert>
        
        <button 
          onClick={() => navigate('/hubs')}
          className="mt-4 px-4 py-2 rounded bg-primary text-white"
        >
          Back to Hubs
        </button>
      </div>
    );
  }

  // If user is not logged in, show public view with login prompt
  if (!session) {
    return (
      <div className="container py-8 space-y-8">
        <HubHeader hub={hub} isAdmin={false} />
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to interact with this hub and access all features.
          </AlertDescription>
        </Alert>
        <HubTabs hub={hub} isAdmin={false} />
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
