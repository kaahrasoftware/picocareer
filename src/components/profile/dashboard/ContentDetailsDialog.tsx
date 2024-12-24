import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ContentList } from "./content/ContentList";
import { ContentStatusFilter } from "./content/ContentStatusFilter";
import { useContentData } from "./content/useContentData";
import { useStatusUpdate } from "./content/useStatusUpdate";
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
  const { items, isLoading } = useContentData(contentType, statusFilter, open);
  const { handleStatusChange } = useStatusUpdate(contentType);

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

        <ContentStatusFilter 
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

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