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
  
  if (!query || query.length <= 2) {
    return null;
  }

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
      if (item && item.type && groupedResults[`${item.type}s`]) {
        groupedResults[`${item.type}s`].push(item);
      }
    });
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'career':
        return <Briefcase className="w-4 h-4 mr-2" />;
      case 'major':
        return <GraduationCap className="w-4 h-4 mr-2" />;
      case 'mentor':
        return <Users className="w-4 h-4 mr-2" />;
      case 'blog':
        return <BookOpen className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  const hasResults = Object.values(groupedResults).some(group => Array.isArray(group) && group.length > 0);

  return (
    <Card className="absolute top-full mt-2 w-full z-50 border border-white/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Command className="border-none bg-transparent">
        <CommandInput placeholder="Type to search..." value={query} readOnly />
        
        {isLoading ? (
          <CommandEmpty>Searching...</CommandEmpty>
        ) : !hasResults ? (
          <CommandEmpty>No results found.</CommandEmpty>
        ) : (
          Object.entries(groupedResults).map(([category, items]) => 
            Array.isArray(items) && items.length > 0 ? (
              <CommandGroup key={category} heading={category.charAt(0).toUpperCase() + category.slice(1)}>
                {items.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => {
                      console.log("Selected:", result);
                      onClose();
                    }}
                    className="cursor-pointer hover:bg-white/10 flex items-center gap-2"
                  >
                    {getIcon(result.type)}
                    {result.type === 'mentor' ? (
                      <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={result.avatar_url || ''} alt={result.title} />
                          <AvatarFallback>{result.title[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{result.title}</div>
                          <div className="text-sm text-muted-foreground">{result.description}</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{result.title}</div>
                        {result.description && (
                          <div className="text-sm text-muted-foreground">{result.description}</div>
                        )}
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null
          )
        )}
      </Command>
    </Card>
  );
};