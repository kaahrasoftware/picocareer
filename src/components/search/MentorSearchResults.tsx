import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, Building2, GraduationCap, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";

interface SearchResult {
  id: string;
  type: 'mentor' | 'career' | 'major';
  title: string;
  description?: string;
  avatar_url?: string;
  top_mentor?: boolean;
  salary_range?: string;
  degree_levels?: string[];
  company?: { name: string } | null;
  position?: string;
  career?: { title: string } | null;
  location?: string;
}

interface MentorSearchResultsProps {
  results: SearchResult[];
}

export const MentorSearchResults = ({ results }: MentorSearchResultsProps) => {
  const navigate = useNavigate();
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  const handleResultClick = (result: SearchResult, event: React.MouseEvent) => {
    // Stop event propagation to prevent it from bubbling up
    event.stopPropagation();
    
    switch (result.type) {
      case 'mentor':
        setSelectedMentorId(result.id);
        break;
      case 'career':
        navigate(`/career/${result.id}`);
        break;
      case 'major':
        navigate(`/program/${result.id}`);
        break;
    }
  };

  const groupedResults = {
    mentors: results.filter(r => r.type === 'mentor'),
    careers: results.filter(r => r.type === 'career'),
    majors: results.filter(r => r.type === 'major')
  };

  return (
    <div className="space-y-8">
      {/* Mentors Section */}
      {groupedResults.mentors.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-picocareer-dark">Mentors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupedResults.mentors.map((result) => (
              <Card
                key={result.id}
                className="flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white"
                onClick={(e) => handleResultClick(result, e)}
              >
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
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Careers Section */}
      {groupedResults.careers.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-picocareer-dark">Careers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupedResults.careers.map((result) => (
              <Card
                key={result.id}
                className="flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white"
                onClick={(e) => handleResultClick(result, e)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-picocareer-primary/10">
                    <Building2 className="h-6 w-6 text-picocareer-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-picocareer-dark truncate">{result.title}</p>
                  </div>
                </div>
                {result.salary_range && (
                  <Badge variant="secondary" className="w-fit mt-auto">
                    {result.salary_range}
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Majors Section */}
      {groupedResults.majors.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-picocareer-dark">Fields of Study</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupedResults.majors.map((result) => (
              <Card
                key={result.id}
                className="flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white"
                onClick={(e) => handleResultClick(result, e)}
              >
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
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Profile Details Dialog */}
      {selectedMentorId && (
        <ProfileDetailsDialog
          userId={selectedMentorId}
          open={!!selectedMentorId}
          onOpenChange={(open) => !open && setSelectedMentorId(null)}
        />
      )}
    </div>
  );
};