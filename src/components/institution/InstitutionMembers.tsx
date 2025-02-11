
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InstitutionMember } from "@/types/database/institutions";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface InstitutionMembersProps {
  institutionId: string;
}

interface MemberWithProfile extends InstitutionMember {
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function InstitutionMembers({ institutionId }: InstitutionMembersProps) {
  const { data: members, isLoading } = useQuery({
    queryKey: ['institution-members', institutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institution_members')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MemberWithProfile[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Members</h2>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.profile.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.profile.full_name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{member.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={member.status === 'Approved' ? 'default' : 'secondary'}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(member.join_date), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {members?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No members yet</h3>
            <p className="text-muted-foreground">Invite members to join this institution.</p>
          </div>
        )}
      </div>
    </div>
  );
}
