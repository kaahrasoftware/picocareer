
import { Command, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { useSearchData } from "@/hooks/useSearchData";
import { useState } from "react";
import { ProfileDetailsDialog } from "./ProfileDetailsDialog";
import { CareerDetailsDialog } from "./CareerDetailsDialog";
import { MentorResultsSection } from "./search/MentorResultsSection";
import { CareerResultsSection } from "./search/CareerResultsSection";
import { MajorResultsSection } from "./search/MajorResultsSection";
import { SearchPagination } from "./search/SearchPagination";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export const SearchResults = ({ query, onClose }: SearchResultsProps) => {
  const { data = [], isLoading } = useSearchData(query);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  
  const groupedResults = {
    mentors: data.filter(item => item.type === 'mentor'),
    careers: data.filter(item => item.type === 'career'),
    majors: data.filter(item => item.type === 'major')
  };

  const getPaginatedResults = (items: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
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
        mentors={getPaginatedResults(groupedResults.mentors)}
        onSelectMentor={(id) => setSelectedProfileId(id)}
      />,
      <CareerResultsSection 
        key="careers"
        careers={getPaginatedResults(groupedResults.careers)}
        onSelectCareer={(id) => setSelectedCareerId(id)}
      />,
      <MajorResultsSection 
        key="majors"
        majors={getPaginatedResults(groupedResults.majors)}
      />
    ];
    
    const hasResults = sections.some(section => {
      if (section.key === 'mentors') return section.props.mentors?.length > 0;
      if (section.key === 'careers') return section.props.careers?.length > 0;
      if (section.key === 'majors') return section.props.majors?.length > 0;
      return false;
    });

    return hasResults ? (
      <>
        {sections}
        <SearchPagination
          currentPage={currentPage}
          totalPages={Math.ceil(Math.max(
            groupedResults.mentors.length,
            groupedResults.careers.length,
            groupedResults.majors.length
          ) / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </>
    ) : <CommandEmpty>No results found</CommandEmpty>;
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
