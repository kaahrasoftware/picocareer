import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { GraduationCap, Briefcase, School, Users } from "lucide-react";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'career' | 'major' | 'school' | 'mentor';
  description?: string;
}

export const SearchResults = ({ query, onClose }: SearchResultsProps) => {
  // Mock data - in a real app, this would come from your backend
  const allResults: SearchResult[] = [
    { id: '1', title: "Software Engineering", type: "career", description: "Design and develop software applications" },
    { id: '2', title: "Data Science", type: "career", description: "Analyze and interpret complex data" },
    { id: '3', title: "Computer Science", type: "major", description: "Study of computation and information" },
    { id: '4', title: "Mathematics", type: "major", description: "Study of numbers, quantities, and shapes" },
    { id: '5', title: "MIT", type: "school", description: "Massachusetts Institute of Technology" },
    { id: '6', title: "Stanford", type: "school", description: "Stanford University" },
    { id: '7', title: "John Smith", type: "mentor", description: "Senior Software Engineer at Google" },
    { id: '8', title: "Sarah Johnson", type: "mentor", description: "Data Science Lead at Amazon" },
  ];

  const filteredResults = query.length > 0 
    ? allResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allResults;

  const getIcon = (type: string) => {
    switch (type) {
      case 'career':
        return <Briefcase className="w-4 h-4 mr-2" />;
      case 'major':
        return <GraduationCap className="w-4 h-4 mr-2" />;
      case 'school':
        return <School className="w-4 h-4 mr-2" />;
      case 'mentor':
        return <Users className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  const groupedResults = {
    careers: filteredResults.filter(r => r.type === 'career'),
    majors: filteredResults.filter(r => r.type === 'major'),
    schools: filteredResults.filter(r => r.type === 'school'),
    mentors: filteredResults.filter(r => r.type === 'mentor'),
  };

  return (
    <Card className="absolute top-full mt-2 w-full z-50 border border-white/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Command className="border-none bg-transparent">
        <CommandInput 
          placeholder="Type to search..." 
          value={query}
          className="h-9"
        />
        
        {filteredResults.length === 0 ? (
          <CommandEmpty>No results found.</CommandEmpty>
        ) : (
          <>
            {Object.entries(groupedResults).map(([category, results]) => 
              results.length > 0 && (
                <CommandGroup key={category} heading={category.charAt(0).toUpperCase() + category.slice(1)}>
                  {results.map((result) => (
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
              )
            )}
          </>
        )}
      </Command>
    </Card>
  );
};