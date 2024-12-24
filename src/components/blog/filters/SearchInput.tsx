import { Input } from "@/components/ui/input";

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export function SearchInput({ searchQuery, setSearchQuery }: SearchInputProps) {
  return (
    <Input
      placeholder="Search blogs by title, content, author..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full"
    />
  );
}