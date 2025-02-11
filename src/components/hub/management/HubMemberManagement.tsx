
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InviteMemberForm } from "./InviteMemberForm";
import { PendingInvites } from "./PendingInvites";
import { MembersList } from "./MembersList";

interface HubMemberManagementProps {
  hubId: string;
}

export function HubMemberManagement({ hubId }: HubMemberManagementProps) {
  // Fetch pending invites
  const { data: pendingInvites, isLoading: isLoadingInvites } = useQuery({
    queryKey: ['hub-pending-invites', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_member_invites')
        .select('*')
        .eq('hub_id', hubId)
        .eq('status', 'pending');

      if (error) throw error;
      return data;
    },
  });

  // Fetch members with the correct foreign key relationship
  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['hub-members-management', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_members')
        .select(`
          *,
          profiles!hub_members_profile_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .eq('hub_id', hubId);

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingMembers || isLoadingInvites) {
    return <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <InviteMemberForm hubId={hubId} />
      <PendingInvites hubId={hubId} pendingInvites={pendingInvites} />
      <MembersList hubId={hubId} members={members} />
    </div>
  );
}
