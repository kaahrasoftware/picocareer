import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'career' | 'major' | 'mentor';
}

export interface CareerSearchResult extends SearchResult {
  type: 'career';
  salary_range: string;
}

export interface MajorSearchResult extends SearchResult {
  type: 'major';
}

export interface MentorSearchResult extends SearchResult {
  type: 'mentor';
  avatar_url: string;
  position: string;
  top_mentor: boolean;
}

export function useSearchData(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function search() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        const [careers, majors, mentors] = await Promise.all([
          supabase
            .from('careers')
            .select('id, title, description, salary_range')
            .textSearch('title', query)
            .limit(5),
          supabase
            .from('majors')
            .select('id, title, description')
            .textSearch('title', query)
            .limit(5),
          supabase
            .from('profiles')
            .select(`
              id,
              full_name,
              bio,
              avatar_url,
              company:companies(name),
              school:schools(name),
              position:careers!profiles_position_fkey(title),
              top_mentor
            `)
            .eq('user_type', 'mentor')
            .textSearch('full_name', query)
            .limit(5)
        ]);

        const searchResults: SearchResult[] = [
          ...(careers.data?.map(career => ({
            id: career.id,
            title: career.title,
            description: career.description,
            type: 'career' as const,
            salary_range: career.salary_range
          })) || []),
          ...(majors.data?.map(major => ({
            id: major.id,
            title: major.title,
            description: major.description,
            type: 'major' as const
          })) || []),
          ...(mentors.data?.map(mentor => ({
            id: mentor.id,
            title: mentor.full_name,
            description: mentor.bio || '',
            type: 'mentor' as const,
            avatar_url: mentor.avatar_url,
            position: mentor.position?.title || '',
            top_mentor: mentor.top_mentor || false
          })) || [])
        ];

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Error",
          description: "Failed to perform search",
          variant: "destructive",
        });
      }
    }

    search();
  }, [query, toast]);

  return { results };
}