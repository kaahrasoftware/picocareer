import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { badgeStyles } from "./BadgeStyles";

interface RelatedMajorsSectionProps {
  careerMajorRelations?: {
    major: {
      title: string;
      id: string;
    };
  }[];
}

export function RelatedMajorsSection({ careerMajorRelations }: RelatedMajorsSectionProps) {
  if (!careerMajorRelations?.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
        <ArrowRight className="h-5 w-5 text-primary" />
        Related Majors
      </h3>
      <div className="flex flex-wrap gap-2">
        {careerMajorRelations.map(({ major }) => (
          <Badge 
            key={major.id} 
            className={badgeStyles.primary}
          >
            {major.title}
          </Badge>
        ))}
      </div>
    </div>
  );
}