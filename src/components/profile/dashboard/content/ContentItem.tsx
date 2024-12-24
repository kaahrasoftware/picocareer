import { ContentStatus } from "../types";
import { StatusSelect } from "./StatusSelect";

interface ContentItemProps {
  item: any;
  handleStatusChange: (itemId: string, newStatus: ContentStatus) => Promise<void>;
  getStatusColor: (status: ContentStatus) => string;
}

export function ContentItem({ item, handleStatusChange, getStatusColor }: ContentItemProps) {
  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{item.title}</h4>
        <div className="flex items-center gap-2">
          <StatusSelect
            status={item.status || "Pending"}
            onStatusChange={(value) => handleStatusChange(item.id, value)}
            getStatusColor={getStatusColor}
          />
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
  );
}