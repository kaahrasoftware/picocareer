import { Briefcase, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";

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
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);

  // Fetch all careers with their relations to match against opportunities
  const { data: careersWithRelations } = useQuery({
    queryKey: ['careers-with-relations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select(`
          id,
          title,
          career_major_relations!inner(
            major_id
          )
        `)
        .eq('status', 'Approved');
      
      if (error) throw error;
      return data;
    },
  });

  // Function to find matching career using career_major_relations
  const findMatchingCareer = (opportunity: string) => {
    return careersWithRelations?.find(career => 
      career.title.toLowerCase() === opportunity.toLowerCase()
    );
  };

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

      {career_opportunities && career_opportunities.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Career Opportunities</h5>
          <div className="flex flex-wrap gap-2">
            {career_opportunities.map((career, index) => {
              const matchingCareer = findMatchingCareer(career);
              return (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className={`bg-[#D3E4FD] text-[#4B5563] border-[#C1D9F9] ${
                    matchingCareer ? 'cursor-pointer hover:bg-[#C1D9F9] transition-colors' : ''
                  }`}
                  onClick={() => matchingCareer && setSelectedCareerId(matchingCareer.id)}
                >
                  {career}
                </Badge>
              );
            })}
          </div>
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

      {selectedCareerId && (
        <CareerDetailsDialog
          careerId={selectedCareerId}
          open={!!selectedCareerId}
          onOpenChange={(open) => !open && setSelectedCareerId(null)}
        />
      )}
    </div>
  );
}