import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type ContentType = "blogs" | "videos" | "careers" | "majors" | "schools" | "companies";
type ContentStatus = "Approved" | "Pending" | "Rejected";

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

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['content-details', contentType],
    queryFn: async () => {
      try {
        console.log('Fetching content with query:', { statusFilter, contentType });
        
        let query = supabase
          .from(contentType)
          .select('*')
          .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Fetched items:', data);
        return data || [];
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('Failed to fetch content. Please try again.');
        throw error;
      }
    },
    enabled: open,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!open) return;

    console.log('Setting up real-time subscription for:', contentType);
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: contentType
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [open, contentType, refetch]);

  const handleStatusChange = async (itemId: string, newStatus: ContentStatus) => {
    try {
      console.log('Updating status:', { itemId, newStatus });
      
      const { error } = await supabase
        .from(contentType)
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Item status has been updated to ${newStatus}`,
      });

      // No need to manually refetch as real-time subscription will handle the update
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error updating status",
        description: "There was an error updating the status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: ContentStatus | null | undefined) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  const filteredItems = items?.filter(item => 
    statusFilter === "all" ? true : item.status === statusFilter
  ) || [];

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

        <ScrollArea className="flex-1 h-[calc(85vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-4 px-1">
              {filteredItems.map((item: any) => (
                <div key={item.id} className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      <Select
                        value={item.status || "Pending"}
                        onValueChange={(value) => handleStatusChange(item.id, value as ContentStatus)}
                      >
                        <SelectTrigger className={`w-[120px] border ${getStatusColor(item.status as ContentStatus)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.description}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No {statusFilter === "all" ? "" : statusFilter} {contentType} found
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}