import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { GraduationCap, Briefcase, Users, BookOpen } from "lucide-react";
import { useSearchData } from "@/hooks/useSearchData";

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
  const groupedResults = {
    careers: [],
    majors: [],
    mentors: [],
    blogs: []
  };

  // Only process data if it exists
  if (data) {
    data.forEach(item => {
      switch (item.type) {
        case 'career':
          groupedResults.careers.push(item);
          break;
        case 'major':
          groupedResults.majors.push(item);
          break;
        case 'mentor':
          groupedResults.mentors.push(item);
          break;
        case 'blog':
          groupedResults.blogs.push(item);
          break;
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

  return (
    <Card className="absolute top-full mt-2 w-full z-50 border border-white/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Command className="border-none bg-transparent">
        <CommandInput placeholder="Type to search..." value={query} />
        
        {isLoading ? (
          <CommandEmpty>Searching...</CommandEmpty>
        ) : (!data || data.length === 0) ? (
          <CommandEmpty>No results found.</CommandEmpty>
        ) : (
          Object.entries(groupedResults).map(([category, items]) => 
            items.length > 0 ? (
              <CommandGroup key={category} heading={category.charAt(0).toUpperCase() + category.slice(1)}>
                {items.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => {
                      console.log("Selected:", result);
                      onClose();
                    }}
                    className="cursor-pointer hover:bg-white/10 flex items-center"
                  >
                    {getIcon(result.type)}
                    <div>
                      <div className="font-medium">{result.title}</div>
                      {result.description && (
                        <div className="text-sm text-muted-foreground">{result.description}</div>
                      )}
                    </div>
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