
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HubMember } from "@/types/database/hubs";

interface HubMembersProps {
  hubId: string;
}

export function HubMembers({ hubId }: HubMembersProps) {
  const { data: members, isLoading } = useQuery({
    queryKey: ['hub-members', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_members')
        .select(`
          *,
          profile:profile_id(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          department:department_id(
            id,
            name
          )
        `)
        .eq('hub_id', hubId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Members</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members?.map((member) => (
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
