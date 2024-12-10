import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Card } from "@/components/ui/card";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export const SearchResults = ({ query, onClose }: SearchResultsProps) => {
  // Mock results - in a real app, this would come from your backend
  const mockResults = [
    { title: "Software Engineering", type: "career" },
    { title: "Data Science", type: "career" },
    { title: "UX Design", type: "career" },
  ].filter(result => 
    result.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Card className="absolute top-full mt-2 w-full z-50 border border-white/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Command className="border-none bg-transparent">
        <CommandInput placeholder="Type to search..." />
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {mockResults.map((result) => (
            <CommandItem
              key={result.title}
              onSelect={() => {
                // Handle selection
                console.log("Selected:", result.title);
                onClose();
              }}
              className="cursor-pointer hover:bg-white/10"
            >
              <span>{result.title}</span>
              <span className="ml-2 text-sm text-gray-400">{result.type}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </Card>
  );
};