import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type TableName = "blogs" | "videos" | "mentor_sessions" | "careers" | "majors" | "schools";

interface ContentStatusCardProps {
  title: string;
  total: number;
  approved: number;
  pending: number;
  rejected?: number;
  tableName: TableName;
  itemId?: string; // Make itemId optional since we're not using it for bulk updates
  onStatusChange?: () => void;
}

export function ContentStatusCard({ 
  title, 
  total, 
  approved, 
  pending, 
  rejected = 0,
  tableName,
  onStatusChange 
}: ContentStatusCardProps) {
  const [changing, setChanging] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    setChanging(true);
    try {
      // Update all pending items in the table to the new status
      const { error } = await supabase
        .from(tableName)
        .update({ status: newStatus })
        .eq('status', 'Pending');

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `All pending ${title.toLowerCase()} have been updated to ${newStatus}`,
      });

      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error updating status",
        description: "There was an error updating the status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">
          {total} total
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <span className="text-sm">
          {approved} approved
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-amber-500" />
        <span className="text-sm">
          {pending} pending
        </span>
      </div>
      {rejected > 0 && (
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm">
            {rejected} rejected
          </span>
        </div>
      )}
      <Select onValueChange={handleStatusChange} disabled={changing || pending === 0}>
        <SelectTrigger className="w-full mt-2">
          <SelectValue placeholder={pending === 0 ? "No pending items" : "Change status for all pending"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Approved">Approve all pending</SelectItem>
          <SelectItem value="Rejected">Reject all pending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}