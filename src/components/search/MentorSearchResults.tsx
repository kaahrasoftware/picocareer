import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { SearchResultCard } from "./SearchResultCard";
import { SearchPagination } from "./SearchPagination";
import { SearchResult } from "@/types/search";

interface MentorSearchResultsProps {
  results: SearchResult[];
}

export const MentorSearchResults = ({ results }: MentorSearchResultsProps) => {
  const navigate = useNavigate();
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [mentorsPage, setMentorsPage] = useState(1);
  const [careersPage, setCareersPage] = useState(1);
  const [majorsPage, setMajorsPage] = useState(1);
  const itemsPerPage = 4;

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'mentor':
        setSelectedMentorId(result.id);
        break;
      case 'career':
        navigate(`/career/${result.id}`);
        break;
      case 'major':
        navigate(`/program/${result.id}`);
        break;
    }
  };

  const getPaginatedResults = (items: SearchResult[], currentPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const groupedResults = {
    mentors: results.filter(r => r.type === 'mentor'),
    careers: results.filter(r => r.type === 'career'),
    majors: results.filter(r => r.type === 'major')
  };

  const renderResultSection = (title: string, items: SearchResult[], currentPage: number, onPageChange: (page: number) => void) => {
    if (items.length === 0) return null;

    const totalPages = Math.ceil(items.length / itemsPerPage);

    return (
      <div>
        <h3 className="text-xl font-semibold mb-4 text-picocareer-dark">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {getPaginatedResults(items, currentPage).map((result) => (
            <SearchResultCard
              key={result.id}
              result={result}
              onClick={handleResultClick}
            />
          ))}
        </div>
        <SearchPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderResultSection("Mentors", groupedResults.mentors, mentorsPage, setMentorsPage)}
      {renderResultSection("Careers", groupedResults.careers, careersPage, setCareersPage)}
      {renderResultSection("Fields of Study", groupedResults.majors, majorsPage, setMajorsPage)}

      {selectedMentorId && (
        <ProfileDetailsDialog
          userId={selectedMentorId}
          open={!!selectedMentorId}
          onOpenChange={(open) => !open && setSelectedMentorId(null)}
        />
      )}
    </div>
  );
};