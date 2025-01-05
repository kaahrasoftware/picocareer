import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, Building2, GraduationCap, MapPin } from "lucide-react";
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
              <Avatar className="h-12 w-12 border-2 border-picocareer-primary/20">
                <AvatarImage src={result.avatar_url} alt={result.title} />
                <AvatarFallback>{result.title?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-picocareer-dark truncate">{result.title}</p>
                {result.career?.title && (
                  <p className="text-sm text-muted-foreground truncate">{result.career.title}</p>
                )}
              </div>
              {result.top_mentor && (
                <Badge className="bg-picocareer-primary/90 hover:bg-picocareer-primary">
                  <Award className="h-3 w-3 mr-1" />
                  Top
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              {result.company?.name && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{result.company.name}</span>
                </div>
              )}
              {result.location && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{result.location}</span>
                </div>
              )}
            </div>
          </>
        );
      case 'career':
        return (
          <>
            <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
              {result.image_url ? (
                <img 
                  src={result.image_url} 
                  alt={result.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{result.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{result.description}</p>
              {result.academic_majors && result.academic_majors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.academic_majors.slice(0, 3).map((major, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-picocareer-primary/10 text-picocareer-primary hover:bg-picocareer-primary/20"
                    >
                      {major}
                    </Badge>
                  ))}
                  {result.academic_majors.length > 3 && (
                    <Badge variant="secondary" className="bg-muted">
                      +{result.academic_majors.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </>
        );
      case 'major':
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-picocareer-primary/10">
                <GraduationCap className="h-6 w-6 text-picocareer-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-picocareer-dark truncate">{result.title}</p>
              </div>
            </div>
            {result.degree_levels && result.degree_levels.length > 0 && (
              <Badge variant="secondary" className="w-fit mt-auto">
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