
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
      
      // Fix: Only transform fields that exist in the database
      return (data || []).map(record => ({
        id: record.id,
        mentee_id: record.mentee_id,
        // Use fallback empty strings for required fields that might not exist in DB
        institution_name: record.institution_name || '',
        degree_type: record.degree_type || '',
        major: record.major || '',
        minor: record.minor || undefined,
        gpa: record.gpa || undefined,
        semester_gpa: record.semester_gpa,
        cumulative_gpa: record.cumulative_gpa,
        credits_attempted: record.credits_attempted,
        credits_earned: record.credits_earned,
        class_rank: record.class_rank?.toString() || '',
        graduation_date: record.graduation_date || undefined,
        honors: record.honors || [],
        awards: record.awards || [],
        relevant_coursework: record.relevant_coursework || [],
        thesis_topic: record.thesis_topic || undefined,
        year: record.year || new Date().getFullYear(),
        semester: record.semester || 'Fall',
        created_at: record.created_at,
        updated_at: record.updated_at
      })) as MenteeAcademicRecord[];
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
      
      // Fix: Transform data to match MenteeEssayResponse interface
      return (data || []).map(response => ({
        ...response,
        status: response.is_draft ? 'draft' as const : 'completed' as const
      })) as MenteeEssayResponse[];
    },
    enabled: !!menteeId,
  });
}

export function useMenteeDataMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Course mutations
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

  // Project mutations
  const addProject = useMutation({
    mutationFn: async (project: Omit<MenteeProject, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('mentee_projects')
        .insert([{
          ...project,
          // Fix: Map UI status to database status
          status: project.status === 'ongoing' ? 'in_progress' : project.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-projects', data.mentee_id] });
      toast({ title: "Project added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add project", variant: "destructive" });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MenteeProject> & { id: string }) => {
      const transformedUpdates = {
        ...updates,
        // Fix: Map UI status to database status
        status: updates.status === 'ongoing' ? 'in_progress' : updates.status
      };
      
      const { data, error } = await supabase
        .from('mentee_projects')
        .update(transformedUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-projects', data.mentee_id] });
      toast({ title: "Project updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update project", variant: "destructive" });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mentee_projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentee-projects'] });
      toast({ title: "Project deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete project", variant: "destructive" });
    },
  });

  // Interest mutations
  const addInterest = useMutation({
    mutationFn: async (interest: Omit<MenteeInterest, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('mentee_interests')
        .insert([interest])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-interests', data.mentee_id] });
      toast({ title: "Interest added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add interest", variant: "destructive" });
    },
  });

  const updateInterest = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MenteeInterest> & { id: string }) => {
      const { data, error } = await supabase
        .from('mentee_interests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-interests', data.mentee_id] });
      toast({ title: "Interest updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update interest", variant: "destructive" });
    },
  });

  const deleteInterest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mentee_interests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentee-interests'] });
      toast({ title: "Interest deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete interest", variant: "destructive" });
    },
  });

  // Essay mutations
  const addEssayResponse = useMutation({
    mutationFn: async (essay: Omit<MenteeEssayResponse, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('mentee_essay_responses')
        .insert([essay])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-essay-responses', data.mentee_id] });
      toast({ title: "Essay response saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save essay response", variant: "destructive" });
    },
  });

  const updateEssayResponse = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MenteeEssayResponse> & { id: string }) => {
      const { data, error } = await supabase
        .from('mentee_essay_responses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-essay-responses', data.mentee_id] });
      toast({ title: "Essay response updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update essay response", variant: "destructive" });
    },
  });

  const deleteEssayResponse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mentee_essay_responses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentee-essay-responses'] });
      toast({ title: "Essay response deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete essay response", variant: "destructive" });
    },
  });

  return {
    // Course mutations
    addCourse,
    updateCourse,
    deleteCourse,
    // Project mutations
    addProject,
    updateProject,
    deleteProject,
    // Interest mutations
    addInterest,
    updateInterest,
    deleteInterest,
    // Essay mutations
    addEssayResponse,
    updateEssayResponse,
    deleteEssayResponse,
  };
}
