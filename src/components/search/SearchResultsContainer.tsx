import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentorSearchResults } from "./MentorSearchResults";
import { CareerResultsSection } from "./CareerResultsSection";
import { MajorResultsSection } from "./MajorResultsSection";
import type { SearchResult } from "@/types/search";
import { isMentorResult, isCareerResult, isMajorResult } from "@/types/search";

interface SearchResultsContainerProps {
  searchQuery: string;
  isLoading: boolean;
  searchResults: SearchResult[];
  onClose: () => void;
}

export const SearchResultsContainer = ({
  searchQuery,
  isLoading,
  searchResults,
  onClose
}: SearchResultsContainerProps) => {
  // Filter results by type
  const mentorResults = searchResults.filter(isMentorResult);
  const careerResults = searchResults.filter(isCareerResult);
  const majorResults = searchResults.filter(isMajorResult);

  return (
    <div className="absolute top-full mt-1 w-full z-50 border border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg rounded-lg overflow-hidden">
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 hover:bg-red-100 text-red-600 hover:text-red-700"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Searching...
            </div>
          ) : searchQuery.length < 3 ? (
            <div className="text-center py-4 text-muted-foreground">
              Type at least 3 characters to search...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No results found
            </div>
          ) : (
            <div className="space-y-8">
              {mentorResults.length > 0 && (
                <MentorSearchResults results={mentorResults} />
              )}
              {careerResults.length > 0 && (
                <CareerResultsSection careers={careerResults} />
              )}
              {majorResults.length > 0 && (
                <MajorResultsSection majors={majorResults} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};