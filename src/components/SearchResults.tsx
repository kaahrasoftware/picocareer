import { Command, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { useSearchData } from "@/hooks/useSearchData";
import { SearchResultGroup } from "./search/SearchResultGroup";
import type { SearchResult } from "@/hooks/useSearchData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ProfileDetailsDialog } from "./ProfileDetailsDialog";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export const SearchResults = ({ query, onClose }: SearchResultsProps) => {
  const { data = [], isLoading } = useSearchData(query);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
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
            ? 'grid grid-cols-3 gap-4' 
            : 'flex gap-4 overflow-x-auto pb-2'}`}
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
    
    // If we have mentor results, show them, otherwise show other results
    if (mentorResults) {
      return mentorResults;
    }

    // If no mentor results, show the regular grouped results with titles
    return Object.entries(groupedResults).map(([category, items]) => (
      items.length > 0 && (
        <div key={category} className="px-4 mb-4">
          <h3 className="text-lg font-semibold mb-3 text-foreground">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h3>
          <SearchResultGroup
            category={category}
            items={items}
            onClose={onClose}
          />
        </div>
      )
    ));
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
    </>
  );
};