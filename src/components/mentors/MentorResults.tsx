import { MentorCard } from "@/components/MentorCard";
import { Mentor } from "@/types/mentor";

interface MentorResultsProps {
  mentors: Mentor[];
}

export function MentorResults({ mentors }: MentorResultsProps) {
  if (mentors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No mentors found matching your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mentors.map((mentor, index) => (
        <MentorCard key={index} {...mentor} />
      ))}
    </div>
  );
}