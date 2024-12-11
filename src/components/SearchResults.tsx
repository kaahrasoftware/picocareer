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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
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

    return (
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 p-4 min-w-max">
          {mentors.map((mentor) => (
            <Card 
              key={mentor.id}
              className="flex flex-col p-4 w-[250px] hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUserId(mentor.id);
              }}
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

    // If no mentor results, show the regular grouped results
    return Object.entries(groupedResults).map(([category, items]) => (
      <SearchResultGroup
        key={category}
        category={category}
        items={items}
        onClose={onClose}
      />
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

      <ProfileDetailsDialog
        userId={selectedUserId || ''}
        open={!!selectedUserId}
        onOpenChange={(open) => {
          if (!open) setSelectedUserId(null);
        }}
      />
    </>
  );
};