
import { Hub } from "@/types/database/hubs";

interface HubHeaderProps {
  hub: Hub;
}

export function HubHeader({ hub }: HubHeaderProps) {
  return (
    <div className="relative">
      {hub.banner_url && (
        <div className="h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={hub.banner_url}
            alt={`${hub.name} banner`}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div className="flex items-start gap-6 p-6">
        <div className="relative -mt-12 flex-shrink-0">
          {hub.logo_url ? (
            <img
              src={hub.logo_url}
              alt={`${hub.name} logo`}
              className="h-24 w-24 rounded-lg border-4 border-background bg-background object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-lg border-4 border-background bg-muted flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {hub.name[0]}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{hub.name}</h1>
          <p className="text-sm text-muted-foreground">{hub.type}</p>
          {hub.description && (
            <p className="text-sm text-muted-foreground mt-2">{hub.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
