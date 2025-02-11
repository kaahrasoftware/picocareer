
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface HubMembersProps {
  hubId: string;
}

export function HubMembers({ hubId }: HubMembersProps) {
  const { data: members, isLoading, error } = useQuery({
    queryKey: ['hub-members', hubId],
    queryFn: async () => {
      console.log('Fetching members for hub:', hubId);
      
      const { data, error } = await supabase
        .from('hub_members')
        .select(`
          id,
          role,
          profile_id,
          profile:profiles!hub_members_profile_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('hub_id', hubId);

      if (error) {
        console.error('Error fetching members:', error);
        // Check if the error is due to RLS policy
        if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          throw new Error('access_denied');
        }
        throw error;
      }
      
      console.log('Fetched members:', data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    // Show special message for access denied
    if (error.message === 'access_denied') {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be a member of this hub to view its members.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading members. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Members (0)</h2>
        <p className="text-muted-foreground">No members found for this hub.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Members ({members.length})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={member.profile?.avatar_url} />
                  <AvatarFallback>
                    {member.profile?.first_name?.[0]}
                    {member.profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {member.profile?.first_name} {member.profile?.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {member.role}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
