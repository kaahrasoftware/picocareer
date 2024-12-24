import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ContentList } from "./content/ContentList";
import type { ContentType, ContentStatus } from "./types";

interface ContentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ContentType;
}

export function ContentDetailsDialog({
  open,
  onOpenChange,
  contentType,
}: ContentDetailsDialogProps) {
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['content-details', contentType],
    queryFn: async () => {
      try {
        console.log('Fetching content with query:', { statusFilter, contentType });
        
        const { data, error } = await supabase
          .from(contentType)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Fetched items:', data);
        return data || [];
      } catch (error) {
        console.error('Error fetching content:', error);
        toast({
          title: "Error",
          description: "Failed to fetch content. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;

    console.log('Setting up real-time subscription for:', contentType);
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: contentType
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['content-details', contentType] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [open, contentType, queryClient]);

  const handleStatusChange = async (itemId: string, newStatus: ContentStatus) => {
    try {
      console.log('Updating status:', { itemId, newStatus, contentType });
      
      const { error } = await supabase
        .from(contentType)
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating status:', error);
        throw error;
      }

      toast({
        title: "Status updated",
        description: `Item status has been updated to ${newStatus}`,
      });

      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['content-details', contentType] });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error updating status",
        description: "There was an error updating the status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {contentType.charAt(0).toUpperCase() + contentType.slice(1)} Details
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ContentStatus | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ContentList
          items={items}
          isLoading={isLoading}
          contentType={contentType}
          statusFilter={statusFilter}
          handleStatusChange={handleStatusChange}
          getStatusColor={getStatusColor}
        />
      </DialogContent>
    </Dialog>
  );
}