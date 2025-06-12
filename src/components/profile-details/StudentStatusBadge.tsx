
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudentStatusBadgeProps {
  status: string | null;
  profileId: string;
  isOwnProfile: boolean;
}

export function StudentStatusBadge({ status, profileId, isOwnProfile }: StudentStatusBadgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"Student" | "Non-Student" | null>(
    status === "Student" || status === "Non-Student" ? status : null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async (newStatus: "Student" | "Non-Student") => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ student_nonstudent: newStatus })
        .eq('id', profileId);

      if (error) throw error;

      setCurrentStatus(newStatus);
      setIsEditing(false);
      toast({
        title: "Status updated",
        description: `Status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentStatus && !isOwnProfile) return null;

  if (isEditing && isOwnProfile) {
    return (
      <div className="flex items-center gap-2">
        <Select onValueChange={handleStatusUpdate} disabled={isUpdating}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Student">Student</SelectItem>
            <SelectItem value="Non-Student">Non-Student</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(false)}
          disabled={isUpdating}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Badge 
        variant={currentStatus === "Student" ? "default" : "secondary"}
        className="text-xs"
      >
        {currentStatus || "Not specified"}
      </Badge>
      {isOwnProfile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-5 w-5 p-0"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
