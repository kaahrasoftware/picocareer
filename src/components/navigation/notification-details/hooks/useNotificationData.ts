import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BlogWithAuthor } from "@/types/blog/types";
import type { Major } from "@/types/database/majors";
import type { Tables } from "@/integrations/supabase/types";

type CareerWithMajors = Tables<"careers"> & {
  career_major_relations: {
    major: {
      title: string;
      id: string;
    };
  }[];
};

export function useNotificationData(contentId: string | undefined, type: string | undefined, dialogOpen: boolean) {
  const { data: majorData } = useQuery({
    queryKey: ['major', contentId],
    queryFn: async () => {
      if (!contentId || type !== 'major_update') return null;
      
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('id', contentId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching major:', error);
        throw error;
      }
      
      return data as Major;
    },
    enabled: !!contentId && type === 'major_update' && dialogOpen,
  });

  const { data: careerData } = useQuery({
    queryKey: ['career', contentId],
    queryFn: async () => {
      if (!contentId || type !== 'career_update') return null;
      
      const { data, error } = await supabase
        .from('careers')
        .select(`
          *,
          career_major_relations(
            major:majors(id, title)
          )
        `)
        .eq('id', contentId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching career:', error);
        throw error;
      }
      
      return data as CareerWithMajors;
    },
    enabled: !!contentId && type === 'career_update' && dialogOpen,
  });

  const { data: blogData } = useQuery({
    queryKey: ['blog', contentId],
    queryFn: async () => {
      if (!contentId || type !== 'blog_update') return null;
      
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .eq('id', contentId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching blog:', error);
        throw error;
      }
      
      return data as BlogWithAuthor;
    },
    enabled: !!contentId && type === 'blog_update' && dialogOpen,
  });

  return { majorData, careerData, blogData };
}