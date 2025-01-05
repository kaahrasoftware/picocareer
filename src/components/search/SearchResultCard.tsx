import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, MapPin } from "lucide-react";
import { SearchResult } from "@/types/search";

interface SearchResultCardProps {
  result: SearchResult;
  onClick: (result: SearchResult) => void;
}

export const SearchResultCard = ({ result, onClick }: SearchResultCardProps) => {
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
                {result.position && (
                  <p className="text-sm text-[#8E9196] truncate">{result.position}</p>
                )}
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
                    <Badge variant="secondary" className="bg-[#8E9196]/20">
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
                      <Badge variant="secondary" className="bg-[#8E9196]/20">
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
    <Card
      className="flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white h-full"
      onClick={() => onClick(result)}
    >
      {renderContent()}
    </Card>
  );
};