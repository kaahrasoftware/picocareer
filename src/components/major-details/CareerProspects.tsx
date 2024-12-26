import { Briefcase, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CareerProspectsProps {
  job_prospects?: string;
  career_opportunities?: string[];
  potential_salary?: string;
  professional_associations?: string[];
  global_applicability?: string;
  related_careers?: {
    career: {
      id: string;
      title: string;
      salary_range: string | null;
    };
  }[];
}

export function CareerProspects({ 
  job_prospects,
  career_opportunities,
  potential_salary,
  professional_associations,
  global_applicability,
  related_careers
}: CareerProspectsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" />
        Career Prospects
      </h4>
      
      {potential_salary && (
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-primary" />
          <span>Potential Salary: {potential_salary}</span>
        </div>
      )}

      {job_prospects && (
        <div>
          <h5 className="text-sm font-medium mb-2">Job Prospects</h5>
          <p className="text-sm text-muted-foreground">{job_prospects}</p>
        </div>
      )}

      {professional_associations && professional_associations.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Professional Associations</h5>
          <div className="flex flex-wrap gap-2">
            {professional_associations.map((association, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[#F2FCE2] text-[#4B5563]"
              >
                {association}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {global_applicability && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2">Global Applicability</h5>
          <p className="text-sm text-muted-foreground">{global_applicability}</p>
        </div>
      )}
    </div>
  );
}