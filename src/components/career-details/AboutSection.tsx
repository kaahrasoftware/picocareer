import { Briefcase, Building2, GraduationCap, TrendingUp, BarChart2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AboutSectionProps {
  description: string;
  learning_objectives?: string[];
  industry?: string;
  work_environment?: string;
  growth_potential?: string;
  job_outlook?: string;
  important_note?: string;
}

export function AboutSection({ 
  description,
  learning_objectives,
  industry,
  work_environment,
  growth_potential,
  job_outlook,
  important_note
}: AboutSectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" />
        About this Career
      </h4>
      <p className="text-muted-foreground">{description}</p>

      {important_note && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Important Note
          </h5>
          <p className="text-sm text-foreground">{important_note}</p>
        </div>
      )}

      {industry && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Industry
          </h5>
          <p className="text-muted-foreground">{industry}</p>
        </div>
      )}
      
      {learning_objectives && learning_objectives.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            Learning Objectives
          </h5>
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

      {job_outlook && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            Job Outlook
          </h5>
          <p className="text-muted-foreground">{job_outlook}</p>
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
          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Growth Potential
          </h5>
          <p className="text-muted-foreground">{growth_potential}</p>
        </div>
      )}
    </div>
  );
}