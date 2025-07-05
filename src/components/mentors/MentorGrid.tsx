
import { Skeleton } from "@/components/ui/skeleton";
import { ModernMentorCard } from "@/components/cards/ModernMentorCard";
import { Mentor } from "@/hooks/useMentors";

interface MentorGridProps {
  mentors: Mentor[];
  isLoading: boolean;
}

export function MentorGrid({ mentors, isLoading }: MentorGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No mentors found</div>
        <p className="text-gray-400">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {mentors.map((mentor) => (
        <ModernMentorCard
          key={mentor.id}
          id={mentor.id}
          name={`${mentor.first_name} ${mentor.last_name}`}
          position={mentor.position}
          company={mentor.company_name}
          location={mentor.location}
          skills={mentor.skills}
          keywords={mentor.keywords}
          rating={mentor.rating}
          totalRatings={mentor.totalRatings}
          avatarUrl={mentor.avatar_url}
          education={mentor.education}
          topMentor={mentor.top_mentor}
          careerTitle={mentor.career_title}
        />
      ))}
    </div>
  );
}
