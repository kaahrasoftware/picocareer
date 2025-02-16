
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface MembersListProps {
  hubId: string;
  members: any[];
}

export function MembersList({ hubId, members }: MembersListProps) {
  const { toast } = useToast();
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('hub_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      // Log the audit event with the correct enum value
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: hubId,
        _action: 'member_role_updated',
        _details: JSON.stringify({ member_id: memberId, new_role: newRole })
      });

      toast({
        title: "Role updated",
        description: "Member role has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (memberId: string, memberName: string) => {
    setMemberToDelete({ id: memberId, name: memberName });
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await supabase
        .from('hub_members')
        .delete()
        .eq('id', memberToDelete.id);

      if (error) throw error;

      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: hubId,
        _action: 'member_removed',
        _details: JSON.stringify({ member_id: memberToDelete.id })
      });

      toast({
        title: "Member removed",
        description: "Member has been removed from the hub",
      });

      setMemberToDelete(null);
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Current Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members?.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">
                      {member.profiles?.first_name} {member.profiles?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                  </div>
                  <Select 
                    defaultValue={member.role}
                    onValueChange={(value) => handleRoleChange(member.id, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => confirmDelete(member.id, `${member.profiles?.first_name} ${member.profiles?.last_name}`)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Member Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToDelete?.name} from this hub? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
