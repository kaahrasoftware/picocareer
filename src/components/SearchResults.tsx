import { Command, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { useSearchData } from "@/hooks/useSearchData";
import type { SearchResult } from "@/hooks/useSearchData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ProfileDetailsDialog } from "./ProfileDetailsDialog";
import { CareerDetailsDialog } from "./CareerDetailsDialog";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export const SearchResults = ({ query, onClose }: SearchResultsProps) => {
  const { data = [], isLoading } = useSearchData(query);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  
  const groupedResults: Record<string, SearchResult[]> = {
    mentors: [],
    careers: [],
    majors: [],
    blogs: []
  };

  // Group results by type
  data?.forEach(item => {
    if (item?.type) {
      const category = `${item.type}s`;
      if (category in groupedResults) {
        groupedResults[category].push(item);
      }
    }
  });

  const renderMentorCards = (mentors: SearchResult[]) => {
    if (!mentors.length) return null;

    const shouldUseGrid = mentors.length > 4;

    return (
      <div className="px-4">
        <h3 className="text-lg font-semibold mb-3 text-foreground">Mentors</h3>
        <div className="w-full">
          <div className={`${shouldUseGrid 
            ? 'grid grid-cols-3 gap-4 place-items-center' 
            : 'flex gap-4 justify-center'}`}
          >
            {mentors.map((mentor) => (
              <Card 
                key={mentor.id}
                className="flex-shrink-0 flex flex-col p-4 w-[250px] hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedProfileId(mentor.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={mentor.avatar_url} alt={mentor.title} />
                    <AvatarFallback>{mentor.title[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{mentor.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {mentor.description}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="self-start">
                  Mentor
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCareerCards = (careers: SearchResult[]) => {
    if (!careers.length) return (
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold mb-3 text-foreground">Careers</h3>
        <p className="text-sm text-muted-foreground">No matching careers found</p>
      </div>
    );

    const shouldUseGrid = careers.length > 4;

    return (
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold mb-3 text-foreground">Careers</h3>
        <div className="w-full">
          <div className={`${shouldUseGrid 
            ? 'grid grid-cols-3 gap-4 place-items-center' 
            : 'flex gap-4 justify-center'}`}
          >
            {careers.map((career) => (
              <Card 
                key={career.id}
                className="flex-shrink-0 flex flex-col p-4 w-[250px] hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedCareerId(career.id)}
              >
                <div className="flex-1 min-w-0 mb-3">
                  <h4 className="font-medium text-sm mb-1">{career.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {career.description}
                  </p>
                </div>
                <Badge variant="secondary" className="self-start">
                  {career.salary_range || `$${career.average_salary?.toLocaleString()}`}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMajorCards = (majors: SearchResult[]) => {
    if (!majors.length) return (
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold mb-3 text-foreground">Majors</h3>
        <p className="text-sm text-muted-foreground">No matching majors found</p>
      </div>
    );

    const shouldUseGrid = majors.length > 4;

    return (
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold mb-3 text-foreground">Majors</h3>
        <div className="w-full">
          <div className={`${shouldUseGrid 
            ? 'grid grid-cols-3 gap-4 place-items-center' 
            : 'flex gap-4 justify-center'}`}
          >
            {majors.map((major) => (
              <Card 
                key={major.id}
                className="flex-shrink-0 flex flex-col p-4 w-[250px] hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0 mb-3">
                  <h4 className="font-medium text-sm mb-1">{major.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {major.description}
                  </p>
                </div>
                <Badge variant="secondary" className="self-start">
                  {major.field_of_study || major.degree_level || 'Major'}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (isLoading) {
      return <CommandEmpty>Searching...</CommandEmpty>;
    }
    
    if (!query) {
      return <CommandEmpty>Start typing to search...</CommandEmpty>;
    }
    
    if (query.length <= 2) {
      return <CommandEmpty>Type at least 3 characters to search...</CommandEmpty>;
    }

    // Show mentor cards at the top
    const mentorResults = renderMentorCards(groupedResults.mentors);
    const careerResults = renderCareerCards(groupedResults.careers);
    const majorResults = renderMajorCards(groupedResults.majors);
    
    if (mentorResults || careerResults || majorResults) {
      return (
        <>
          {mentorResults}
          {careerResults}
          {majorResults}
        </>
      );
    }

    return <CommandEmpty>No results found</CommandEmpty>;
  };

  return (
    <>
      <Card className="search-results absolute top-full mt-1 w-full z-50 border border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg rounded-lg overflow-hidden">
        <Command className="border-none bg-transparent">
          <CommandInput 
            placeholder="Type to search..." 
            value={query}
            readOnly
            className="h-9"
          />
          <CommandList className="max-h-[500px] overflow-y-auto scrollbar-hide">
            {renderResults()}
          </CommandList>
        </Command>
      </Card>

      {selectedProfileId && (
        <ProfileDetailsDialog
          userId={selectedProfileId}
          open={!!selectedProfileId}
          onOpenChange={(open) => !open && setSelectedProfileId(null)}
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