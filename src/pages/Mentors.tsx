
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MentorListHeader } from '@/components/mentors/MentorListHeader';
import { MentorListContent } from '@/components/mentors/MentorListContent';
import type { Mentor } from '@/types/mentor';

export default function Mentors() {
  const { data: mentors = [], isLoading, error } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          position,
          location,
          bio,
          skills,
          top_mentor,
          company:companies(name),
          school:schools(name)
        `)
        .eq('user_type', 'mentor')
        .limit(50);

      if (error) throw error;

      return (data || []).map(profile => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        position: profile.position,
        company: profile.company?.name,
        location: profile.location,
        skills: profile.skills || [],
        bio: profile.bio,
        imageUrl: profile.avatar_url,
        top_mentor: profile.top_mentor || false,
        career_title: profile.position,
        education: profile.school?.name,
        rating: 0,
        totalRatings: 0,
        sessionsHeld: "0"
      })) as Mentor[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <MentorListHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <MentorListHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Unable to load mentors</h3>
            <p className="text-muted-foreground">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MentorListHeader />
      <MentorListContent mentors={mentors} />
    </div>
  );
}
