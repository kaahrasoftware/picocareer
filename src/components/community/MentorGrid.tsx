import { ProfileCard } from "@/components/community/ProfileCard";
import { LoadMoreButton } from "./LoadMoreButton";
import { useState } from "react";
import type { Profile } from "@/types/database/profiles";

interface MentorGridProps {
  profiles: (Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  })[];
  isLoading: boolean;
}

export function MentorGrid({ profiles, isLoading }: MentorGridProps) {
  const [displayCount, setDisplayCount] = useState(12);
  const displayedProfiles = profiles.slice(0, displayCount);
  const hasMore = displayCount < profiles.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 3, profiles.length));
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No mentors found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProfiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <LoadMoreButton 
          hasMore={hasMore} 
          isLoading={isLoading} 
          onClick={handleLoadMore} 
        />
      </div>
    </div>
  );
}