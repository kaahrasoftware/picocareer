
import { Hub } from "@/types/database/hubs";

interface HubHeaderProps {
  hub: Hub;
}

export function HubHeader({ hub }: HubHeaderProps) {
  return (
    <div className="relative">
      {hub.banner_url ? (
        <div className="h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={hub.banner_url}
            alt={`${hub.name} banner`}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div 
          className="h-48 w-full rounded-t-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${hub.brand_colors?.primary || '#9b87f5'}, ${hub.brand_colors?.secondary || '#7E69AB'})`
          }}
        >
          <div 
            className="text-4xl font-bold"
            style={{ color: '#ffffff' }}
          >
            {hub.name}
          </div>
        </div>
      )}
      
      <div 
        className="flex items-start gap-6 p-6"
        style={{
          background: `linear-gradient(to bottom right, ${hub.brand_colors?.primary}08, ${hub.brand_colors?.secondary}08)`,
          borderBottom: `1px solid ${hub.brand_colors?.primary}20`
        }}
      >
        <div className="relative -mt-12 flex-shrink-0">
          {hub.logo_url ? (
            <img
              src={hub.logo_url}
              alt={`${hub.name} logo`}
              className="h-24 w-24 rounded-lg border-4 border-background bg-background object-cover shadow-lg"
              style={{
                borderColor: hub.brand_colors?.primary || '#9b87f5'
              }}
            />
          ) : (
            <div 
              className="h-24 w-24 rounded-lg border-4 border-background flex items-center justify-center shadow-lg"
              style={{ 
                backgroundColor: hub.brand_colors?.accent || '#8B5CF6',
                borderColor: hub.brand_colors?.primary || '#9b87f5'
              }}
            >
              <span className="text-2xl font-bold text-white">
                {hub.name[0]}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h1 
            className="text-2xl font-bold"
            style={{
              color: hub.brand_colors?.primary || '#9b87f5'
            }}
          >
            {hub.name}
          </h1>
          <div 
            className="text-sm px-2 py-1 rounded-full inline-block"
            style={{ 
              backgroundColor: `${hub.brand_colors?.secondary || '#7E69AB'}15`,
              color: hub.brand_colors?.secondary || '#7E69AB',
              border: `1px solid ${hub.brand_colors?.secondary}30`
            }}
          >
            {hub.type}
          </div>
          {hub.description && (
            <p 
              className="text-sm mt-2"
              style={{
                color: hub.brand_colors?.secondary || '#7E69AB'
              }}
            >
              {hub.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
