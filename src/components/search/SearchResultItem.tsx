import { CommandItem } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, GraduationCap, Users, BookOpen } from "lucide-react";
import type { SearchResult } from "@/hooks/useSearchData";

interface SearchResultItemProps {
  result: SearchResult;
  onSelect: () => void;
}

export const SearchResultItem = ({ result, onSelect }: SearchResultItemProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'career':
        return <Briefcase className="w-4 h-4" />;
      case 'major':
        return <GraduationCap className="w-4 h-4" />;
      case 'mentor':
        return <Users className="w-4 h-4" />;
      case 'blog':
        return <BookOpen className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <CommandItem
      onSelect={onSelect}
      className="flex items-center gap-2 py-3 px-2 cursor-pointer hover:bg-accent/50 rounded-md"
    >
      {getIcon(result.type)}
      {result.type === 'mentor' ? (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={result.avatar_url || ''} alt={result.title} />
            <AvatarFallback>{result.title?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{result.title}</span>
            {result.description && (
              <span className="text-xs text-muted-foreground">{result.description}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{result.title}</span>
          {result.description && (
            <span className="text-xs text-muted-foreground">{result.description}</span>
          )}
        </div>
      )}
    </CommandItem>
  );
};