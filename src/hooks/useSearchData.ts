import { useQuery } from "@tanstack/react-query";
import type { SearchResult } from "@/types/search/types";
import { searchMajors } from "./search/useSearchMajors";
import { searchCareers } from "./search/useSearchCareers";
import { searchMentors } from "./search/useSearchMentors";

export function useSearchData(searchTerm: string) {
  return useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!searchTerm) return [];

      const [majors, careers, mentors] = await Promise.all([
        searchMajors(searchTerm),
        searchCareers(searchTerm),
        searchMentors(searchTerm)
      ]);

      return [...majors, ...careers, ...mentors];
    },
    enabled: searchTerm.length > 2,
  });
}