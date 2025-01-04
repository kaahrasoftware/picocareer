import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentorSearchResults } from "./MentorSearchResults";

interface SearchResultsContainerProps {
  searchQuery: string;
  isLoading: boolean;
  searchResults: any[];
  onClose: () => void;
}

export const SearchResultsContainer = ({
  searchQuery,
  isLoading,
  searchResults,
  onClose
}: SearchResultsContainerProps) => {
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
            <MentorSearchResults results={searchResults} />
          )}
        </div>
      </div>
    </div>
  );
};