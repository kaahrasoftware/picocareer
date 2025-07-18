import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MenteeCourse } from '@/types/mentee-profile';

export function useFavoriteCourses(menteeId: string) {
  return useQuery({
    queryKey: ['favorite-courses', menteeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentee_courses')
        .select('*')
        .eq('mentee_id', menteeId)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return (data || []) as MenteeCourse[];
    },
    enabled: !!menteeId,
  });
}

export function useUpdateFavoriteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, isFavorite }: { courseId: string; isFavorite: boolean }) => {
      const { data, error } = await supabase
        .from('mentee_courses')
        .update({ is_favorite: isFavorite })
        .eq('id', courseId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-courses', data.mentee_id] });
      queryClient.invalidateQueries({ queryKey: ['mentee-courses', data.mentee_id] });
      toast.success('Favorite course updated successfully');
    },
    onError: (error) => {
      console.error('Error updating favorite course:', error);
      toast.error('Failed to update favorite course');
    },
  });
}