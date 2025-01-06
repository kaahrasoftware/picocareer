import { Building2, Briefcase, Users } from "lucide-react";

interface CareerHeaderProps {
  title: string;
  industry?: string | null;
  salary_range?: string | null;
  image_url?: string | null;
  profiles_count?: number;
  onImageClick: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
}

export function CareerHeader({
  title,
  industry,
  salary_range,
  image_url,
  profiles_count = 0,
  onImageClick,
}: CareerHeaderProps) {
  return (
    <div className="space-y-3">
      {image_url ? (
        <div 
          className="relative aspect-video w-full rounded-lg overflow-hidden cursor-pointer group"
          onClick={onImageClick}
        >
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div 
          className="relative aspect-video w-full rounded-lg bg-muted flex items-center justify-center cursor-pointer group overflow-hidden"
          onClick={onImageClick}
        >
          <Briefcase className="h-12 w-12 text-muted-foreground/50" />
        </div>
      )}
      
      <div className="space-y-1.5">
        <h3 className="font-semibold text-lg leading-tight">
          {title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {industry && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              <span>{industry}</span>
            </div>
          )}
          {salary_range && (
            <>
              {industry && <span>•</span>}
              <span>{salary_range}</span>
            </>
          )}
          {profiles_count > 0 && (
            <>
              {(industry || salary_range) && <span>•</span>}
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{profiles_count} profiles</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}