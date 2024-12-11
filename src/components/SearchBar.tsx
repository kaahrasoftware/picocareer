import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchResults } from "@/components/SearchResults";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside of search bar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: careers } = useQuery({
    queryKey: ['searchCareers', searchQuery],
    queryFn: async () => {
      const { data } = await supabase
        .from('careers')
        .select('*')
        .ilike('title', `%${searchQuery}%`)
        .limit(5);
      return data || [];
    },
    enabled: searchQuery.length > 0,
  });

  const { data: majors } = useQuery({
    queryKey: ['searchMajors', searchQuery],
    queryFn: async () => {
      const { data } = await supabase
        .from('majors')
        .select('*')
        .ilike('title', `%${searchQuery}%`)
        .limit(5);
      return data || [];
    },
    enabled: searchQuery.length > 0,
  });

  const { data: mentors } = useQuery({
    queryKey: ['searchMentors', searchQuery],
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'mentor')
        .or(`name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%,position.ilike.%${searchQuery}%,education.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
        .limit(5);
      return data || [];
    },
    enabled: searchQuery.length > 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(true);
  };

  return (
    <div className="relative flex-1 max-w-2xl mx-auto" ref={searchBarRef}>
      <Input
        type="text"
        placeholder="Search careers, majors, schools, mentors..."
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => setShowResults(true)}
        className="w-full pl-4 pr-12 py-2 bg-background border-border text-foreground placeholder:text-muted-foreground"
      />
      <Button
        size="icon"
        className="absolute right-1 top-1 bg-transparent hover:bg-muted"
      >
        <Search className="h-4 w-4" />
      </Button>
      <SearchResults 
        query={searchQuery}
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        careers={careers}
        majors={majors}
        mentors={mentors}
      />
    </div>
  );
};