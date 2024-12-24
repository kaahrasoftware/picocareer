import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentItem } from "./ContentItem";
import type { ContentType, ContentStatus } from "../types";

interface ContentListProps {
  items: any[];
  isLoading: boolean;
  contentType: ContentType;
  statusFilter: ContentStatus | "all";
  handleStatusChange: (itemId: string, newStatus: ContentStatus) => Promise<void>;
  getStatusColor: (status: ContentStatus) => string;
}

export function ContentList({ 
  items, 
  isLoading, 
  contentType,
  statusFilter,
  handleStatusChange,
  getStatusColor
}: ContentListProps) {
  const filteredItems = items?.filter(item => 
    statusFilter === "all" ? true : item.status === statusFilter
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No {statusFilter === "all" ? "" : statusFilter} {contentType} found
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-[calc(85vh-200px)]">
      <div className="space-y-4 px-1">
        {filteredItems.map((item) => (
          <ContentItem
            key={item.id}
            item={item}
            handleStatusChange={handleStatusChange}
            getStatusColor={getStatusColor}
          />
        ))}
      </div>
    </ScrollArea>
  );
}