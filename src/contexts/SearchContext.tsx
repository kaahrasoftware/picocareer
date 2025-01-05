import { createContext, useContext, ReactNode } from 'react';
import { useSearchQuery } from '@/hooks/useSearchQuery';
import { SearchResult } from '@/types/search';

interface SearchContextType {
  searchResults: SearchResult[];
  isLoading: boolean;
  handleSearch: (value: string) => Promise<SearchResult[]>;
  setSearchResults: (results: SearchResult[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { searchResults, isLoading, handleSearch, setSearchResults } = useSearchQuery();

  const value: SearchContextType = {
    searchResults,
    isLoading,
    handleSearch,
    setSearchResults
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};