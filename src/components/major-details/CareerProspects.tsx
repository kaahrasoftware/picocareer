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

      {related_careers && related_careers.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Related Careers</h5>
          <div className="flex flex-wrap gap-2">
            {related_careers.map(({ career }) => (
              <Badge 
                key={career.id} 
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {career.title} {career.salary_range && `(${career.salary_range})`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {career_opportunities && career_opportunities.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Career Opportunities</h5>
          <div className="flex flex-wrap gap-2">
            {career_opportunities.map((career, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="bg-[#D3E4FD] text-[#4B5563] border-[#C1D9F9]"
              >
                {career}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {job_prospects && (
        <p className="text-sm text-muted-foreground">{job_prospects}</p>
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