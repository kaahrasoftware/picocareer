import { createContext, useContext, ReactNode } from 'react';
import { useSearchQuery } from '@/hooks/useSearchQuery';

interface SearchContextType {
  searchResults: any[];
  isLoading: boolean;
  handleSearch: (value: string) => void;
  setSearchResults: (results: any[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const searchQuery = useSearchQuery();

  return (
    <SearchContext.Provider value={searchQuery}>
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