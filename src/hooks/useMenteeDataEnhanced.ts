
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EnhancedMenteeInterest {
  id: string;
  mentee_id: string;
  category: string;
  interest_name: string;
  description?: string;
  proficiency_level?: string;
  related_career_id?: string;
  related_major_id?: string;
  created_at: string;
  updated_at: string;
  // Enhanced fields with actual names
  career_title?: string;
  major_title?: string;
  display_name: string; // The actual name to display
}

export function useMenteeInterestsEnhanced(menteeId: string) {
  return useQuery({
    queryKey: ['mentee-interests-enhanced', menteeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentee_interests')
        .select(`
          *,
          careers:related_career_id(id, title),
          majors:related_major_id(id, title)
        `)
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include display names
      const enhancedData: EnhancedMenteeInterest[] = (data || []).map(interest => {
        let displayName = interest.interest_name;
        let careerTitle = undefined;
        let majorTitle = undefined;
        
        // For career category, use the career title if available
        if (interest.category === 'career' && interest.careers) {
          careerTitle = interest.careers.title;
          displayName = interest.careers.title;
        }
        
        // For academic category, use the major title if available
        if (interest.category === 'academic' && interest.majors) {
          majorTitle = interest.majors.title;
          displayName = interest.majors.title;
        }
        
        return {
          ...interest,
          career_title: careerTitle,
          major_title: majorTitle,
          display_name: displayName
        };
      });
      
      return enhancedData;
    },
    enabled: !!menteeId,
  });
}

export function useMenteeDataMutationsEnhanced() {
  const queryClient = useQueryClient();

  const addInterest = useMutation({
    mutationFn: async (interestData: Omit<EnhancedMenteeInterest, 'id' | 'created_at' | 'updated_at' | 'career_title' | 'major_title' | 'display_name'>) => {
      const { data, error } = await supabase
        .from('mentee_interests')
        .insert(interestData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-interests-enhanced', data.mentee_id] });
      toast.success('Interest added successfully');
    },
    onError: (error) => {
      console.error('Error adding interest:', error);
      toast.error('Failed to add interest');
    },
  });

  const updateInterest = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<EnhancedMenteeInterest> & { id: string }) => {
      const { data, error } = await supabase
        .from('mentee_interests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-interests-enhanced', data.mentee_id] });
      toast.success('Interest updated successfully');
    },
    onError: (error) => {
      console.error('Error updating interest:', error);
      toast.error('Failed to update interest');
    },
  });

  const deleteInterest = useMutation({
    mutationFn: async (interestId: string) => {
      const { error } = await supabase
        .from('mentee_interests')
        .delete()
        .eq('id', interestId);
      
      if (error) throw error;
      return interestId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentee-interests-enhanced'] });
      toast.success('Interest deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting interest:', error);
      toast.error('Failed to delete interest');
    },
  });

  return { addInterest, updateInterest, deleteInterest };
}
