import { Command, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { useSearchData } from "@/hooks/useSearchData";
import { useState } from "react";
import { ProfileDetailsDialog } from "./ProfileDetailsDialog";
import { CareerDetailsDialog } from "./CareerDetailsDialog";
import { MentorResultsSection } from "./search/MentorResultsSection";
import { CareerResultsSection } from "./search/CareerResultsSection";
import { MajorResultsSection } from "./search/MajorResultsSection";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export const SearchResults = ({ query, onClose }: SearchResultsProps) => {
  const { searchResults, isLoading } = useSearchData();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  
  const groupedResults = {
    mentors: searchResults.filter(item => item.type === 'mentor'),
    careers: searchResults.filter(item => item.type === 'career'),
    majors: searchResults.filter(item => item.type === 'major')
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

    const sections = [
      <MentorResultsSection 
        key="mentors"
        mentors={groupedResults.mentors}
        onSelectMentor={(id) => setSelectedProfileId(id)}
      />,
      <CareerResultsSection 
        key="careers"
        careers={groupedResults.careers}
        onSelectCareer={(id) => setSelectedCareerId(id)}
      />,
      <MajorResultsSection 
        key="majors"
        majors={groupedResults.majors}
      />
    ];
    
    const hasResults = sections.some(section => 
      section.props.mentors?.length > 0 || 
      section.props.careers?.length > 0 || 
      section.props.majors?.length > 0
    );

    return hasResults ? sections : <CommandEmpty>No results found</CommandEmpty>;
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