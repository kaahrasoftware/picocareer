import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type TableName = "blogs" | "videos" | "mentor_sessions" | "careers" | "majors" | "schools";
type ContentStatus = "Approved" | "Pending" | "Rejected";

interface ContentStatusCardProps {
  title: string;
  total: number;
  approved?: number;
  pending?: number;
  rejected?: number;
  tableName: TableName;
  itemId: string;
  onStatusChange?: () => void;
}

export function ContentStatusCard({
  title,
  total,
  approved = 0,
  pending = 0,
  rejected = 0,
  tableName,
  itemId,
  onStatusChange,
}: ContentStatusCardProps) {
  const [changing, setChanging] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: ContentStatus) => {
    if (tableName === 'mentor_sessions') return; // Skip for mentor sessions as they don't have status

    setChanging(true);
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ status: newStatus })
        .eq('status', 'Pending');

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `All pending ${title.toLowerCase()} have been ${newStatus.toLowerCase()}.`,
      });

      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Total: {total}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {tableName !== 'mentor_sessions' && (
            <>
              <div className="flex justify-between text-sm">
                <span>Approved</span>
                <span>{approved}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span>{pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rejected</span>
                <span>{rejected}</span>
              </div>
            </>
          )}
          {tableName === 'mentor_sessions' && (
            <>
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span>{approved}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Upcoming</span>
                <span>{pending}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {tableName !== 'mentor_sessions' && pending > 0 && (
        <Select
          disabled={changing}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Update all pending..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Approved">Approve All Pending</SelectItem>
            <SelectItem value="Rejected">Reject All Pending</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}