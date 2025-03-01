
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberRole } from "@/types/database/hubs";
import { useAddMembers } from "./useAddMembers";

interface AddMemberFormProps {
  hubId: string;
}

export function AddMemberForm({ hubId }: AddMemberFormProps) {
  const [emails, setEmails] = useState<string>("");
  const [role, setRole] = useState<MemberRole>("member");
  const { isAdding, addMembers } = useAddMembers(hubId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailList = emails.split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    if (emailList.length === 0) {
      toast({
        title: "No emails entered",
        description: "Please enter at least one email address",
        variant: "destructive",
      });
      return;
    }
    
    // For each email, directly add the member via RPC function
    const results = await Promise.all(
      emailList.map(async (email) => {
        const { data, error } = await supabase.rpc(
          'add_hub_member',
          {
            _hub_id: hubId,
            _email: email,
            _role: role
          }
        );
        
        return { email, success: !error && data?.success, message: error?.message || data?.message };
      })
    );
    
    // Count successes and failures
    const successes = results.filter(r => r.success).length;
    const failures = results.filter(r => !r.success).length;
    
    // Show appropriate toast and refresh data
    if (successes > 0) {
      toast({
        title: "Members added",
        description: `${successes} member${successes !== 1 ? 's' : ''} added to the hub. They will receive notifications.`,
      });
      
      // Clear input
      setEmails("");
      
      // Refresh members list
      queryClient.invalidateQueries({
        queryKey: ['hub-members-management', hubId]
      });
    } else {
      toast({
        title: "Failed to add members",
        description: failures > 0 
          ? `${failures} email${failures !== 1 ? 's' : ''} could not be processed.` 
          : "There was an error adding members.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Members</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emails">Email Addresses</Label>
            <Input
              id="emails"
              placeholder="Enter email addresses (separate with commas or new lines)"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="min-h-[80px]"
              disabled={isAdding}
            />
            <p className="text-sm text-muted-foreground">
              Members will be added directly and notified. They'll need to confirm their membership when they visit the hub.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={role} 
              onValueChange={(value) => setRole(value as MemberRole)}
              disabled={isAdding}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" disabled={isAdding || !emails.trim()}>
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Members"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
