import { useState } from "react";
import { SearchInput } from "./search/SearchInput";
import { SearchResultsContainer } from "./search/SearchResultsContainer";
import { useSearchResults } from "@/hooks/useSearchResults";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export const SearchBar = ({ className = "", placeholder }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { searchResults, isLoading, handleSearch, setSearchResults } = useSearchResults();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleCloseSearch = () => {
    setIsFocused(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="relative w-full search-container mb-24">
      <div className="relative flex items-center w-full max-w-3xl mx-auto">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          className={className}
          placeholder={placeholder || "Search mentors, careers, or majors..."}
        />
      </div>
      
      {isFocused && (
        <SearchResultsContainer
          searchQuery={searchQuery}
          isLoading={isLoading}
          searchResults={searchResults}
          onClose={handleCloseSearch}
        />
      )}
    </div>
  );
};