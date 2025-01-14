import type { SearchResult } from "@/types/search";
import { MentorSearchCard } from "./cards/MentorSearchCard";
import { CareerSearchCard } from "./cards/CareerSearchCard";
import { MajorSearchCard } from "./cards/MajorSearchCard";

interface SearchResultCardProps {
  result: SearchResult;
  onClick?: (result: SearchResult) => void;
}

export const SearchResultCard = ({ result, onClick }: SearchResultCardProps) => {
  switch (result.type) {
    case 'mentor':
      return <MentorSearchCard result={result} onClick={onClick} />;
    case 'career':
      return <CareerSearchCard result={result} onClick={onClick} />;
    case 'major':
      return <MajorSearchCard result={result} onClick={onClick} />;
    default:
      return null;
  }
};