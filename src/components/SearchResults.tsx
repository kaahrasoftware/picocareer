import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { GraduationCap, Briefcase, Users, BookOpen } from "lucide-react";
import { useSearchData } from "@/hooks/useSearchData";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { SearchResult } from "@/hooks/useSearchData";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export const SearchResults = ({ query, onClose }: SearchResultsProps) => {
  const { data, isLoading } = useSearchData(query);
  
  // Initialize empty arrays for each category
  const groupedResults: Record<string, SearchResult[]> = {
    careers: [],
    majors: [],
    mentors: [],
    blogs: []
  };

  // Only process data if it exists and is an array
  if (Array.isArray(data)) {
    data.forEach(item => {
      if (item && typeof item === 'object' && 'type' in item) {
        const category = `${item.type}s`;
        if (category in groupedResults) {
          groupedResults[category].push(item);
        }
      }
    });
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'career':
        return <Briefcase className="w-4 h-4" />;
      case 'major':
        return <GraduationCap className="w-4 h-4" />;
      case 'mentor':
        return <Users className="w-4 h-4" />;
      case 'blog':
        return <BookOpen className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Check if there are any results in any category
  const hasResults = Object.values(groupedResults).some(group => 
    Array.isArray(group) && group.length > 0
  );

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
    
    if (!hasResults) {
      return <CommandEmpty>No results found.</CommandEmpty>;
    }

    return Object.entries(groupedResults).map(([category, items]) => {
      // Skip if no items in category
      if (!Array.isArray(items) || items.length === 0) {
        return null;
      }

      return (
        <CommandGroup 
          key={category} 
          heading={category.charAt(0).toUpperCase() + category.slice(1)}
        >
          {items.map((result) => (
            <CommandItem
              key={result.id}
              onSelect={() => {
                console.log("Selected:", result);
                onClose();
              }}
              className="flex items-center gap-2 py-2 cursor-pointer hover:bg-accent/50"
            >
              {getIcon(result.type)}
              {result.type === 'mentor' ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={result.avatar_url || ''} alt={result.title} />
                    <AvatarFallback>{result.title[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{result.title}</span>
                    {result.description && (
                      <span className="text-xs text-muted-foreground">{result.description}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{result.title}</span>
                  {result.description && (
                    <span className="text-xs text-muted-foreground">{result.description}</span>
                  )}
                </div>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      );
    });
  };

  return (
    <Card className="search-results absolute top-full mt-1 w-full z-50 border border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg rounded-lg overflow-hidden">
      <Command className="border-none bg-transparent">
        <CommandInput 
          placeholder="Type to search..." 
          value={query}
          readOnly
          className="h-9"
        />
        <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
          {renderResults()}
        </div>
      </Command>
    </Card>
  );
};