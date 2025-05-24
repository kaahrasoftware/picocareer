
import { Badge } from "@/components/ui/badge";
import { Briefcase, Globe, Users, DollarSign } from "lucide-react";

interface CareerProspectsProps {
  job_prospects: string | null;
  career_opportunities: string[] | null;
  professional_associations: string[] | null;
  global_applicability: string | null;
  related_careers?: {
    career: {
      id: string;
      title: string;
      salary_range: string | null;
    };
  }[];
  potential_salary: string | null;
}

export function CareerProspects({
  job_prospects,
  career_opportunities,
  professional_associations,
  global_applicability,
  related_careers,
  potential_salary
}: CareerProspectsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
        Career Prospects
      </h3>

      {potential_salary && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            Potential Salary
          </h4>
          <Badge 
            variant="outline"
            className="bg-red-500 text-black border-red-600 font-medium dark:bg-red-600 dark:text-black dark:border-red-700"
          >
            {potential_salary}
          </Badge>
        </div>
      )}

      {job_prospects && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Job Market</h4>
          <p className="text-sm text-muted-foreground">{job_prospects}</p>
        </div>
      )}

      {career_opportunities && career_opportunities.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Career Paths</h4>
          <div className="flex flex-wrap gap-2">
            {career_opportunities.map((opportunity, index) => (
              <Badge key={index} variant="outline" className="bg-background">
                {opportunity}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {professional_associations && professional_associations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            Professional Associations
          </h4>
          <div className="flex flex-wrap gap-2">
            {professional_associations.map((association, index) => (
              <Badge key={index} variant="outline" className="bg-background">
                {association}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {global_applicability && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
            Global Applicability
          </h4>
          <p className="text-sm text-muted-foreground">{global_applicability}</p>
        </div>
      )}
    </div>
  );
}
