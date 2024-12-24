import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

interface AboutSectionProps {
  description: string;
  learning_objectives?: string[];
  industry?: string;
  work_environment?: string;
  growth_potential?: string;
}

export function AboutSection({ 
  description,
  learning_objectives,
  industry,
  work_environment,
  growth_potential
}: AboutSectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" />
        About this Career
      </h4>
      <p className="text-muted-foreground">{description}</p>

      {industry && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2">Industry</h5>
          <p className="text-muted-foreground">{industry}</p>
        </div>
      )}
      
      {learning_objectives && learning_objectives.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2">Learning Objectives</h5>
          <div className="flex flex-wrap gap-2">
            {learning_objectives.map((objective, index) => (
              <Badge 
                key={index}
                variant="outline"
                className="bg-[#D3E4FD] text-[#4B5563]"
              >
                {objective}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {work_environment && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2">Work Environment</h5>
          <p className="text-muted-foreground">{work_environment}</p>
        </div>
      )}

      {growth_potential && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2">Growth Potential</h5>
          <p className="text-muted-foreground">{growth_potential}</p>
        </div>
      )}
    </div>
  );
}