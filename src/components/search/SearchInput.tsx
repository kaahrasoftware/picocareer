import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  className?: string;
  placeholder?: string;
}

export const SearchInput = ({ 
  value, 
  onChange, 
  onFocus,
  className = "", 
  placeholder = "Search mentors by name, skills, education, company, or interests..." 
}: SearchInputProps) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        className={`w-full h-10 pl-9 pr-4 rounded-md bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
      />
    </div>
  );
}