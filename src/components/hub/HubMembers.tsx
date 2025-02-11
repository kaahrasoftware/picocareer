
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
          *,
          profile:profiles(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          department:hub_departments(
            id,
            name
          )
        `)
        .eq('hub_id', hubId);

      if (error) {
        console.error('Error fetching members:', error);
        throw error;
      }
      
      console.log('Fetched members:', data);
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  if (error) {
    console.error('Error in HubMembers:', error);
    return <div>Error loading members</div>;
  }

  if (!members || members.length === 0) {
    return <div>No members found</div>;
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
            <CardContent>
              {member.department && (
                <div className="text-sm text-muted-foreground">
                  Department: {member.department.name}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
