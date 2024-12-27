import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SearchResults } from "./SearchResults";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, MapPin } from "lucide-react";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchBar = ({ className, ...props }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearch.length < 3) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          position,
          location,
          bio,
          company:companies(name),
          career:careers!profiles_position_fkey(title)
        `)
        .eq('user_type', 'mentor')
        .or(
          `first_name.ilike.%${debouncedSearch}%,` +
          `last_name.ilike.%${debouncedSearch}%,` +
          `full_name.ilike.%${debouncedSearch}%,` +
          `bio.ilike.%${debouncedSearch}%,` +
          `location.ilike.%${debouncedSearch}%`
        )
        .limit(5);

      if (error) {
        console.error('Error fetching search results:', error);
        return;
      }

      setSearchResults(data || []);
    };

    fetchResults();
  }, [debouncedSearch]);

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isSearchContainer = target.closest('.search-container');
    const isSearchResults = target.closest('.search-results');
    
    if (!isSearchContainer && !isSearchResults) {
      setIsFocused(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full search-container">
      <div className="relative flex items-center w-full max-w-3xl mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            className="w-full h-10 pl-9 pr-4 rounded-md bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search mentors by name, location, or position..."
            {...props}
          />
        </div>
      </div>
      
      {isFocused && searchResults.length > 0 && (
        <div className="absolute top-full mt-1 w-full z-50 border border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg rounded-lg overflow-hidden p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((mentor) => (
              <Card key={mentor.id} className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mentor.avatar_url} alt={`${mentor.first_name} ${mentor.last_name}`} />
                    <AvatarFallback>
                      {mentor.first_name?.[0]}
                      {mentor.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">
                      {mentor.first_name} {mentor.last_name}
                    </h4>
                    {(mentor.career?.title || mentor.company?.name) && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Building2 className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {mentor.career?.title}
                          {mentor.career?.title && mentor.company?.name && " at "}
                          {mentor.company?.name}
                        </span>
                      </div>
                    )}
                    {mentor.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{mentor.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};