
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingInvitesProps {
  hubId: string;
}

export function PendingInvites({ hubId }: PendingInvitesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending (unconfirmed) members
  const { data: pendingMembers, isLoading } = useQuery({
    queryKey: ['hub-pending-members', hubId],
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
        .eq('hub_id', hubId)
        .eq('status', 'Approved')
        .eq('confirmed', false);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pendingMembers?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium">
                    {member.profiles?.first_name} {member.profiles?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                </div>
                <span className="text-sm text-amber-500 px-2 py-1 bg-amber-50 rounded-full">
                  Waiting for confirmation
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
