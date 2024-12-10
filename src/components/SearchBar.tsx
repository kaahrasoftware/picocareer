import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchResults } from "@/components/SearchResults";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.length > 0);
  };

  return (
    <div className="relative flex-1 max-w-2xl mx-auto">
      <Input
        type="text"
        placeholder="Search here..."
        value={searchQuery}
        onChange={handleInputChange}
        className="w-full pl-4 pr-12 py-2 bg-background border-border text-foreground placeholder:text-muted-foreground"
      />
      <Button
        size="icon"
        className="absolute right-1 top-1 bg-transparent hover:bg-muted"
      >
        <Search className="h-4 w-4" />
      </Button>
      {showResults && <SearchResults query={searchQuery} onClose={() => setShowResults(false)} />}
    </div>
  );
};