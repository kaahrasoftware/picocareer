import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MentorCard } from "@/components/MentorCard";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { Users } from "lucide-react";

interface CareerMentorListProps {
  careerId: string;
}

export function CareerMentorList({ careerId }: CareerMentorListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const MENTORS_PER_PAGE = 6;

  const { data: mentors, isLoading } = useQuery({
    queryKey: ['career-mentors', careerId, currentPage],
    queryFn: async () => {
      const start = (currentPage - 1) * MENTORS_PER_PAGE;
      const end = start + MENTORS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          position,
          company:companies(name),
          location,
          bio,
          skills,
          top_mentor,
          total_booked_sessions
        `, { count: 'exact' })
        .eq('position', careerId)
        .eq('user_type', 'mentor')
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      return {
        mentors: data.map(mentor => ({
          id: mentor.id,
          name: mentor.full_name || '',
          imageUrl: mentor.avatar_url || '',
          title: mentor.position || '',
          company: mentor.company?.name || '',
          location: mentor.location,
          bio: mentor.bio,
          skills: mentor.skills,
          top_mentor: mentor.top_mentor,
          stats: {
            mentees: '0',
            connected: '0',
            recordings: '0'
          }
        })),
        total: count || 0
      };
    },
    enabled: !!careerId,
  });

  if (isLoading) {
    return <div>Loading mentors...</div>;
  }

  if (!mentors || mentors.mentors.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(mentors.total / MENTORS_PER_PAGE);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Career Mentors
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mentors.mentors.map((mentor) => (
          <MentorCard key={mentor.id} {...mentor} />
        ))}
      </div>

      {totalPages > 1 && (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}