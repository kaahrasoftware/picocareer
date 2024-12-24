import { Building2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CareerHeaderProps {
  title: string;
  industry?: string;
  salary_range?: string;
  image_url?: string;
}

export function CareerHeader({ title, industry, salary_range, image_url }: CareerHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-4">
      {image_url ? (
        <div className="h-24 w-24 rounded-lg overflow-hidden ring-2 ring-background shadow-lg">
          <img 
            src={image_url} 
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-24 w-24 rounded-lg bg-muted/50 flex items-center justify-center ring-2 ring-background shadow-lg">
          <Briefcase className="h-12 w-12 text-muted-foreground/50" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold mb-1 break-words">{title}</h3>
        {industry && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Building2 className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{industry}</span>
          </div>
        )}
        {salary_range && (
          <Badge 
            variant="outline" 
            className="bg-[#FFDEE2] text-[#4B5563] mt-2"
          >
            {salary_range}
          </Badge>
        )}
      </div>
    </div>
  );
}