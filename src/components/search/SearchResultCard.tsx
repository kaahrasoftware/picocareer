import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { MajorDetails } from "@/components/MajorDetails";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { SearchResult } from "@/types/search";

interface SearchResultCardProps {
  result: SearchResult;
  onClick?: (result: SearchResult) => void;
}

export const SearchResultCard = ({ result, onClick }: SearchResultCardProps) => {
  const [selectedMajor, setSelectedMajor] = useState<any | null>(null);
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuthSession();

  const handleClick = () => {
    if (onClick) {
      onClick(result);
      return;
    }

    if (result.type === 'mentor') {
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Join our community to connect with amazing mentors and unlock your career potential!",
          variant: "default",
          className: "bg-green-50 border-green-200",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/auth")}
              className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              Login
            </Button>
          ),
        });
        return;
      }
    } else if (result.type === 'major') {
      setSelectedMajor(result);
    } else if (result.type === 'career') {
      setSelectedCareerId(result.id);
    }
  };

  const renderContent = () => {
    switch (result.type) {
      case 'mentor':
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <ProfileAvatar
                avatarUrl={result.avatar_url}
                size="sm"
                editable={false}
              />
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
                  {result.keywords.slice(0, 3).map((keyword, index) => (
                    <Badge 
                      key={index}
                      variant="secondary"
                      className="bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
                    >
                      {keyword}
                    </Badge>
                  ))}
                  {result.keywords.length > 3 && (
                    <Badge 
                      variant="secondary" 
                      className="bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
                    >
                      +{result.keywords.length - 3}
                    </Badge>
                  )}
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
                    {result.academic_majors.slice(0, 3).map((major, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
                      >
                        {major}
                      </Badge>
                    ))}
                    {result.academic_majors.length > 3 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
                      >
                        +{result.academic_majors.length - 3}
                      </Badge>
                    )}
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
              <div className="p-2 rounded-full bg-[#F2FCE2]">
                <GraduationCap className="h-6 w-6 text-[#1A1F2C]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1A1F2C] truncate">{result.title}</p>
              </div>
            </div>
            {result.common_courses && result.common_courses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.common_courses.slice(0, 3).map((course, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-[#F2FCE2] text-[#1A1F2C] hover:bg-[#E5F6D3]"
                  >
                    {course}
                  </Badge>
                ))}
                {result.common_courses.length > 3 && (
                  <Badge 
                    variant="secondary" 
                    className="bg-[#F2FCE2] text-[#1A1F2C] hover:bg-[#E5F6D3]"
                  >
                    +{result.common_courses.length - 3}
                  </Badge>
                )}
              </div>
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

      {selectedMajor && (
        <MajorDetails
          major={selectedMajor}
          open={!!selectedMajor}
          onOpenChange={(open) => !open && setSelectedMajor(null)}
        />
      )}

      {selectedCareerId && (
        <CareerDetailsDialog
          careerId={selectedCareerId}
          open={!!selectedCareerId}
          onOpenChange={(open) => !open && setSelectedCareerId(null)}
        />
      )}
    </>
  );
};