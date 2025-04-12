
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
      {mentors.map((mentor) => (
        <MentorCard 
          key={mentor.id} 
          id={mentor.id}
          name={mentor.name}
          position={mentor.position || mentor.career_title}
          company={mentor.company}
          location={mentor.location}
          skills={mentor.skills}
          avatarUrl={mentor.imageUrl}
          rating={mentor.rating}
          totalRatings={mentor.totalRatings}
          sessionsHeld={mentor.sessionsHeld}
          menteeCount={mentor.stats?.mentees ? parseInt(mentor.stats.mentees) : undefined}
          connectionRate={mentor.stats?.connected ? parseInt(mentor.stats.connected) : undefined}
        />
      ))}
    </div>
  );
}
