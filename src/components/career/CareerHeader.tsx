interface CareerHeaderProps {
  title: string;
  industry?: string;
  salary_range?: string;
  image_url?: string;
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
    <div className="flex flex-col gap-2 mb-4">
      {image_url && (
        <div 
          className="relative w-full aspect-video mb-2 cursor-pointer overflow-hidden rounded-lg"
          onClick={onImageClick}
        >
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      
      <div className="space-y-1">
        <h3 className="font-semibold text-lg leading-none">
          {title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {industry && (
            <span>{industry}</span>
          )}
          {industry && salary_range && (
            <span>•</span>
          )}
          {salary_range && (
            <span>{salary_range}</span>
          )}
          {(industry || salary_range) && profiles_count > 0 && (
            <span>•</span>
          )}
          {profiles_count > 0 && (
            <span>{profiles_count} profiles</span>
          )}
        </div>
      </div>
    </div>
  );
}