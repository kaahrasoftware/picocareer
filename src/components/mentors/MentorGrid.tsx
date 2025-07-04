
import { ModernMentorCard } from "@/components/cards/ModernMentorCard";
import { PageLoader } from "@/components/ui/page-loader";

interface MentorGridProps {
  mentors: any[];
  isLoading: boolean;
}

export function MentorGrid({ mentors, isLoading }: MentorGridProps) {
  if (isLoading) {
    return <PageLoader isLoading={true} variant="cards" count={6} />;
  }

  if (mentors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No mentors found</h3>
        <p className="text-gray-600">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {mentors.map((mentor) => (
        <ModernMentorCard
          key={mentor.id}
          id={mentor.id}
          name={`${mentor.first_name} ${mentor.last_name}`}
          position={mentor.position || mentor.career_title}
          company={mentor.company_name}
          location={mentor.location}
          skills={mentor.skills || []}
          keywords={mentor.keywords || []}
          rating={mentor.rating || 0}
          totalRatings={mentor.totalRatings || 0}
          avatarUrl={mentor.avatar_url}
          education={mentor.education}
          topMentor={mentor.top_mentor}
        />
      ))}
    </div>
  );
}
