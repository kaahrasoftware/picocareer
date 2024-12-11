import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchResults } from "@/components/SearchResults";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(true);
  };

  const handleClose = () => {
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <div className="relative flex-1 max-w-2xl mx-auto" ref={searchContainerRef}>
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
      {showResults && <SearchResults query={searchQuery} onClose={handleClose} />}
    </div>
  );
};