
import { format } from "date-fns";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { HubResource } from "@/types/database/hubs";
import { getResourceIcon } from "./ResourceIcon";

interface ResourceCardProps {
  resource: HubResource;
  onClick: () => void;
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  return (
    <Card 
      className="transition-colors hover:bg-accent cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
          {getResourceIcon(resource)}
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">{resource.title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {resource.description}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {resource.category && (
            <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs mb-2">
              {resource.category}
            </span>
          )}
          <div className="flex flex-col items-end gap-1">
            <time>
              {format(new Date(resource.created_at), 'MMM d, yyyy')}
            </time>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
