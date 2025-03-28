import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { MajorDetails } from "@/components/MajorDetails";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { SearchResult } from "@/types/search";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";

interface SearchResultCardProps {
  result: SearchResult;
  onClick?: (result: SearchResult) => void;
}

export const SearchResultCard = ({ result, onClick }: SearchResultCardProps) => {
  const [isCareerDialogOpen, setIsCareerDialogOpen] = useState(false);
  const [isMajorDialogOpen, setIsMajorDialogOpen] = useState(false);
  const [isMentorDialogOpen, setIsMentorDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuthSession();

  const handleMentorClick = () => {
    setIsMentorDialogOpen(true);
  };

  const renderContent = () => {
    switch (result.type) {
      case 'mentor':
        return (
          <>
            <div className="flex items-center gap-2">
              <ProfileAvatar
                avatarUrl={result.avatar_url || ""}
                imageAlt={result.title || "Profile"}
                size="sm"
                editable={false}
              />
              <div>
                <h3 className="font-semibold">{result.title}</h3>
                <p className="text-xs text-muted-foreground">{result.subtitle}</p>
              </div>
            </div>
            {result.keywords && result.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto">
                {result.keywords.slice(0, 3).map((keyword, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="text-xs bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
                  >
                    {keyword}
                  </Badge>
                ))}
                {result.keywords.length > 3 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
                  >
                    +{result.keywords.length - 3}
                  </Badge>
                )}
              </div>
            )}
            <Button 
              variant="outline" 
              className="mt-4 w-full bg-background hover:bg-muted/50 transition-colors"
              onClick={handleMentorClick}
            >
              View Details
            </Button>
          </>
        );
      case 'career':
        return (
          <>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-[#1A1F2C]">{result.title}</h3>
              <p className="text-sm text-[#8E9196] mb-3 line-clamp-2">{result.description}</p>
              {result.salary_range && (
                <Badge 
                  variant="secondary"
                  className="bg-red-100 text-red-700 hover:bg-red-200"
                >
                  {result.salary_range}
                </Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              className="mt-4 w-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsCareerDialogOpen(true);
              }}
            >
              View Details
            </Button>
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
            <Button 
              variant="outline" 
              className="mt-4 w-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsMajorDialogOpen(true);
              }}
            >
              View Details
            </Button>
          </>
        );
    }
  };

  return (
    <>
      <Card
        className="flex flex-col p-4 bg-white h-full"
      >
        {renderContent()}
      </Card>

      {result.type === 'career' && (
        <CareerDetailsDialog
          careerId={result.id}
          open={isCareerDialogOpen}
          onOpenChange={setIsCareerDialogOpen}
        />
      )}

      {result.type === 'major' && (
        <MajorDetails
          major={result}
          open={isMajorDialogOpen}
          onOpenChange={setIsMajorDialogOpen}
        />
      )}

      {result.type === 'mentor' && (
        <ProfileDetailsDialog
          userId={result.id}
          open={isMentorDialogOpen}
          onOpenChange={setIsMentorDialogOpen}
        />
      )}
    </>
  );
};
