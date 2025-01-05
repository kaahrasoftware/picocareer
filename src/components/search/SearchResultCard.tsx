import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import { SearchResult } from "@/types/search";
import { useState } from "react";
import { CareerDetailsDialog } from "../CareerDetailsDialog";
import { MajorDetails } from "../MajorDetails";

interface SearchResultCardProps {
  result: SearchResult;
  onClick: (result: SearchResult) => void;
}

export const SearchResultCard = ({ result, onClick }: SearchResultCardProps) => {
  const [showCareerDetails, setShowCareerDetails] = useState(false);
  const [showMajorDetails, setShowMajorDetails] = useState(false);

  const handleClick = () => {
    if (result.type === 'mentor') {
      onClick(result);
    } else if (result.type === 'career') {
      setShowCareerDetails(true);
    } else if (result.type === 'major') {
      setShowMajorDetails(true);
    }
  };

  const renderContent = () => {
    switch (result.type) {
      case 'mentor':
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12 border-2 border-[#FEF7CD]">
                <AvatarImage src={result.avatar_url} alt={result.title} />
                <AvatarFallback>{result.title?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1A1F2C] truncate">{result.title}</p>
                <div className="space-y-1">
                  {result.career?.title && (
                    <p className="text-sm text-[#8E9196] truncate">{result.career.title}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              {result.keywords && result.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.keywords.map((keyword, index) => (
                    <Badge 
                      key={index}
                      variant="secondary"
                      className="bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      case 'career':
        return (
          <>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-[#1A1F2C]">{result.title}</h3>
              <p className="text-sm text-[#8E9196] mb-3 line-clamp-2">{result.description}</p>
              <div className="space-y-3">
                {result.academic_majors && result.academic_majors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.academic_majors.map((major, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
                      >
                        {major}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        );
      case 'major':
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-[#FEF7CD]">
                <GraduationCap className="h-6 w-6 text-[#1A1F2C]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1A1F2C] truncate">{result.title}</p>
              </div>
            </div>
            {result.degree_levels && result.degree_levels.length > 0 && (
              <Badge variant="secondary" className="w-fit mt-auto bg-[#FEF7CD] text-[#1A1F2C]">
                {result.degree_levels.join(', ')}
              </Badge>
            )}
          </>
        );
    }
  };

  return (
    <>
      <Card
        className="flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white h-full"
        onClick={handleClick}
      >
        {renderContent()}
      </Card>

      {result.type === 'career' && (
        <CareerDetailsDialog
          careerId={result.id}
          open={showCareerDetails}
          onOpenChange={setShowCareerDetails}
        />
      )}

      {result.type === 'major' && (
        <MajorDetails
          major={{
            id: result.id,
            title: result.title,
            description: result.description || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            featured: false,
            degree_levels: result.degree_levels || [],
            common_courses: result.common_courses || [],
            career_opportunities: result.career_opportunities || [],
            learning_objectives: [],
            interdisciplinary_connections: [],
            job_prospects: null,
            certifications_to_consider: [],
            affiliated_programs: [],
            gpa_expectations: null,
            transferable_skills: [],
            tools_knowledge: [],
            potential_salary: null,
            passion_for_subject: null,
            skill_match: [],
            professional_associations: [],
            global_applicability: null,
            common_difficulties: [],
            majors_to_consider_switching_to: [],
            intensity: null,
            stress_level: null,
            dropout_rates: null,
            profiles_count: null,
          }}
          open={showMajorDetails}
          onOpenChange={setShowMajorDetails}
        />
      )}
    </>
  );
};
