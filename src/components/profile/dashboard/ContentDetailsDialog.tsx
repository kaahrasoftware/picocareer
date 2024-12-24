import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ContentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: string;
}

export function ContentDetailsDialog({
  open,
  onOpenChange,
  contentType,
}: ContentDetailsDialogProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: items, isLoading } = useQuery({
    queryKey: ['content-details', contentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(contentType)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const filteredItems = items?.filter(item => 
    statusFilter === "all" ? true : item.status === statusFilter
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {contentType.charAt(0).toUpperCase() + contentType.slice(1)} Details
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
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

        <div className="overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="bg-muted p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{item.title}</h4>
                  <Badge variant={item.status === 'Approved' ? 'default' : item.status === 'Rejected' ? 'destructive' : 'outline'}>
                    {item.status}
                  </Badge>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                )}
                <div className="text-xs text-muted-foreground">
                  Created: {format(new Date(item.created_at), 'PPP')}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No {statusFilter === "all" ? "" : statusFilter} {contentType} found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}