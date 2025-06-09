
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { 
  MenteeCourse, 
  MenteeProject, 
  MenteeAcademicRecord, 
  MenteeInterest, 
  MenteeEssayResponse,
  EssayPrompt 
} from "@/types/mentee-profile";

export function useMenteeCourses(menteeId?: string) {
  return useQuery({
    queryKey: ['mentee-courses', menteeId],
    queryFn: async () => {
      if (!menteeId) return [];
      const { data, error } = await supabase
        .from('mentee_courses')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('year', { ascending: false })
        .order('semester');
      
      if (error) throw error;
      return data as MenteeCourse[];
    },
    enabled: !!menteeId,
  });
}

export function useMenteeProjects(menteeId?: string) {
  return useQuery({
    queryKey: ['mentee-projects', menteeId],
    queryFn: async () => {
      if (!menteeId) return [];
      const { data, error } = await supabase
        .from('mentee_projects')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as MenteeProject[];
    },
    enabled: !!menteeId,
  });
}

export function useMenteeAcademicRecords(menteeId?: string) {
  return useQuery({
    queryKey: ['mentee-academic-records', menteeId],
    queryFn: async () => {
      if (!menteeId) return [];
      const { data, error } = await supabase
        .from('mentee_academic_records')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('year', { ascending: false })
        .order('semester');
      
      if (error) throw error;
      return data as MenteeAcademicRecord[];
    },
    enabled: !!menteeId,
  });
}

export function useMenteeInterests(menteeId?: string) {
  return useQuery({
    queryKey: ['mentee-interests', menteeId],
    queryFn: async () => {
      if (!menteeId) return [];
      const { data, error } = await supabase
        .from('mentee_interests')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('category');
      
      if (error) throw error;
      return data as MenteeInterest[];
    },
    enabled: !!menteeId,
  });
}

export function useEssayPrompts() {
  return useQuery({
    queryKey: ['essay-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('essay_prompts')
        .select('*')
        .eq('is_active', true)
        .order('category');
      
      if (error) throw error;
      return data as EssayPrompt[];
    },
  });
}

export function useMenteeEssayResponses(menteeId?: string) {
  return useQuery({
    queryKey: ['mentee-essay-responses', menteeId],
    queryFn: async () => {
      if (!menteeId) return [];
      const { data, error } = await supabase
        .from('mentee_essay_responses')
        .select(`
          *,
          prompt:essay_prompts(*)
        `)
        .eq('mentee_id', menteeId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as MenteeEssayResponse[];
    },
    enabled: !!menteeId,
  });
}

export function useMenteeDataMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addCourse = useMutation({
    mutationFn: async (course: Omit<MenteeCourse, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('mentee_courses')
        .insert([course])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-courses', data.mentee_id] });
      toast({ title: "Course added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add course", variant: "destructive" });
    },
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MenteeCourse> & { id: string }) => {
      const { data, error } = await supabase
        .from('mentee_courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-courses', data.mentee_id] });
      toast({ title: "Course updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update course", variant: "destructive" });
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mentee_courses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentee-courses'] });
      toast({ title: "Course deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete course", variant: "destructive" });
    },
  });

  return {
    addCourse,
    updateCourse,
    deleteCourse,
  };
}
