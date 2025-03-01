
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, MoreVertical, UserX, ShieldAlert, Shield, User, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MemberRole } from "@/types/database/hubs";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MembersListProps {
  hubId: string;
  members: any[];
}

export function MembersList({ hubId, members = [] }: MembersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredMembers = members?.filter((member) => {
    const fullName = `${member.profiles?.first_name || ''} ${member.profiles?.last_name || ''}`.toLowerCase();
    const email = (member.profiles?.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
    try {
      const { error } = await supabase
        .from('hub_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ['hub-members-management', hubId]
      });

      toast({
        title: "Role updated",
        description: "Member role has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('hub_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ['hub-members-management', hubId]
      });

      toast({
        title: "Member removed",
        description: "Member has been removed from the hub."
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case "admin":
        return <ShieldAlert className="h-4 w-4 mr-1" />;
      case "moderator":
        return <Shield className="h-4 w-4 mr-1" />;
      case "faculty":
        return <User className="h-4 w-4 mr-1" />;
      case "student":
        return <Users className="h-4 w-4 mr-1" />;
      default:
        return <User className="h-4 w-4 mr-1" />;
    }
  };

  if (!members || members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">No members found for this hub.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Members ({filteredMembers.length})</span>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members..."
            className="max-w-xs"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={member.profiles?.avatar_url} />
                  <AvatarFallback>
                    {member.profiles?.first_name?.[0] || ''}
                    {member.profiles?.last_name?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.profiles?.first_name} {member.profiles?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.profiles?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={member.confirmed ? "default" : "outline"}
                  className="ml-auto"
                >
                  {member.confirmed ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Confirmed
                    </>
                  ) : (
                    "Pending Confirmation"
                  )}
                </Badge>
                <Badge 
                  variant="secondary"
                  className="flex items-center"
                >
                  {getRoleIcon(member.role)}
                  {member.role}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleRoleChange(member.id, "admin")}
                      disabled={member.role === "admin"}
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRoleChange(member.id, "moderator")}
                      disabled={member.role === "moderator"}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Make Moderator
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRoleChange(member.id, "member")}
                      disabled={member.role === "member"}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Make Member
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRoleChange(member.id, "faculty")}
                      disabled={member.role === "faculty"}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Make Faculty
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRoleChange(member.id, "student")}
                      disabled={member.role === "student"}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Make Student
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
