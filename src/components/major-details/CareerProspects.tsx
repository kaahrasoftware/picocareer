
import { Badge } from "@/components/ui/badge";
import { Briefcase, Globe, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CareerProspectsProps {
  job_prospects: string | null;
  career_opportunities: string[] | null;
  professional_associations: string[] | null;
  global_applicability: string | null;
  potential_salary?: string | null;
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
  professional_associations,
  global_applicability,
  potential_salary,
  related_careers
}: CareerProspectsProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Briefcase className="mr-2 h-5 w-5 text-green-600" />
        Career Prospects
      </h3>

      {potential_salary && (
        <div className="mb-4 p-3 bg-green-50/50 rounded-md border border-green-100 dark:bg-green-900/20 dark:border-green-800/30">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800 dark:text-green-300">Potential Salary</h4>
              <p className="text-green-700 dark:text-green-400 font-medium">{potential_salary}</p>
            </div>
          </div>
        </div>
      )}
      
      {job_prospects && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Job Outlook</h4>
          <p className="text-gray-700 dark:text-gray-300">{job_prospects}</p>
        </div>
      )}
      
      {career_opportunities && career_opportunities.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Career Opportunities</h4>
          <div className="flex flex-wrap gap-2">
            {career_opportunities.map((opportunity, index) => (
              <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {opportunity}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {professional_associations && professional_associations.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2 flex items-center">
            <Users className="mr-1 h-4 w-4 text-green-600" />
            Professional Associations
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            {professional_associations.map((association, index) => (
              <li key={index}>{association}</li>
            ))}
          </ul>
        </div>
      )}
      
      {global_applicability && (
        <div className="mb-4">
          <h4 className="font-medium mb-2 flex items-center">
            <Globe className="mr-1 h-4 w-4 text-green-600" /> 
            Global Applicability
          </h4>
          <p className="text-gray-700 dark:text-gray-300">{global_applicability}</p>
        </div>
      )}

      {related_careers && related_careers.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Related Careers</h4>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
            {related_careers.map((relation, index) => (
              <div key={index} className="p-2 rounded border bg-white/50 dark:bg-gray-800/50">
                <p className="font-medium">{relation.career.title}</p>
                {relation.career.salary_range && (
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {relation.career.salary_range}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
