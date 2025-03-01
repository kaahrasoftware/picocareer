
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users, CheckCircle2 } from "lucide-react";
import { SearchInput } from "@/components/search/SearchInput";
import { SelectFilter } from "@/components/community/filters/SelectFilter";
import { Badge } from "@/components/ui/badge";

interface HubMembersProps {
  hubId: string;
}

const memberRoles = ["admin", "moderator", "member", "faculty", "student"];

export function HubMembers({ hubId }: HubMembersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Fetch hub members
  const { data: members, isLoading, error } = useQuery({
    queryKey: ['hub-members', hubId],
    queryFn: async () => {
      console.log('Fetching members for hub:', hubId);
      
      const { data, error } = await supabase
        .from('hub_members')
        .select(`
          id,
          role,
          confirmed,
          profile_id,
          profiles!hub_members_profile_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('hub_id', hubId)
        .eq('status', 'Approved');

      if (error) {
        console.error('Error fetching members:', error);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
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

  // Get confirmed members only for display in the count
  const confirmedMembers = members.filter(m => m.confirmed);

  // Filter members based on search query and selected role
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.profiles?.first_name} ${member.profiles?.last_name}`.toLowerCase();
    const matchesSearch = searchQuery === "" || fullName.includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h2 className="text-xl font-semibold">
          Members ({confirmedMembers.length})
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1"
          placeholder="Search members by name..."
        />
        <SelectFilter
          value={selectedRole}
          onValueChange={setSelectedRole}
          placeholder="Role"
          options={memberRoles}
          className="w-full sm:w-[200px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="transition-colors hover:bg-accent">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                  <AvatarImage src={member.profiles?.avatar_url} />
                  <AvatarFallback>
                    {member.profiles?.first_name?.[0]}
                    {member.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {member.profiles?.first_name} {member.profiles?.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize flex items-center gap-2">
                    {member.role}
                    {member.confirmed && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Confirmed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No members found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}
