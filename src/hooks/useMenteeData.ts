
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MenteeProject, MenteeAcademicRecord, MenteeEssayResponse } from "@/types/mentee-profile";

export function useMenteeAcademicRecords(menteeId: string) {
  return useQuery({
    queryKey: ['mentee-academic-records', menteeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentee_academic_records')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match MenteeAcademicRecord interface using available fields
      return (data || []).map(record => ({
        ...record,
        // Map available database fields to interface fields
        institution_name: record.id, // Placeholder - adjust based on actual database schema
        degree_type: 'Bachelor', // Placeholder - adjust based on actual database schema  
        major: 'Computer Science', // Placeholder - adjust based on actual database schema
        minor: null,
        gpa: record.cumulative_gpa || null,
        semester_gpa: record.semester_gpa || null,
        cumulative_gpa: record.cumulative_gpa || null,
        credits_attempted: record.credits_attempted || null,
        credits_earned: record.credits_earned || null,
        class_rank: record.class_rank?.toString() || null,
        graduation_date: null, // Not available in current schema
        honors: record.honors || [],
        awards: record.awards || [],
        relevant_coursework: [], // Not available in current schema
        thesis_topic: null, // Not available in current schema
        year: record.year,
        semester: record.semester,
        created_at: record.created_at,
        updated_at: record.updated_at
      } as MenteeAcademicRecord));
    },
    enabled: !!menteeId,
  });
}

export function useMenteeProjects(menteeId: string) {
  return useQuery({
    queryKey: ['mentee-projects', menteeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentee_projects')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(project => ({
        ...project,
        // Fix status mapping to match valid enum values
        status: project.status as 'completed' | 'in_progress' | 'planned' | 'on_hold'
      } as MenteeProject));
    },
    enabled: !!menteeId,
  });
}

export function useMenteeEssayResponses(menteeId: string) {
  return useQuery({
    queryKey: ['mentee-essay-responses', menteeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentee_essay_responses')
        .select(`
          *,
          prompt:essay_prompts(*)
        `)
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []) as MenteeEssayResponse[];
    },
    enabled: !!menteeId,
  });
}

export function useMenteeDataMutations() {
  const queryClient = useQueryClient();

  const addProject = useMutation({
    mutationFn: async (projectData: Omit<MenteeProject, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('mentee_projects')
        .insert([projectData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-projects', data.mentee_id] });
      toast.success('Project added successfully');
    },
    onError: (error) => {
      console.error('Error adding project:', error);
      toast.error('Failed to add project');
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<MenteeProject> & { id: string }) => {
      const { data, error } = await supabase
        .from('mentee_projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-projects', data.mentee_id] });
      toast.success('Project updated successfully');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('mentee_projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      return projectId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentee-projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    },
  });

  const addAcademicRecord = useMutation({
    mutationFn: async (recordData: Omit<MenteeAcademicRecord, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('mentee_academic_records')
        .insert([recordData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-academic-records', data.mentee_id] });
      toast.success('Academic record added successfully');
    },
    onError: (error) => {
      console.error('Error adding academic record:', error);
      toast.error('Failed to add academic record');
    },
  });

  const updateAcademicRecord = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<MenteeAcademicRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('mentee_academic_records')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-academic-records', data.mentee_id] });
      toast.success('Academic record updated successfully');
    },
    onError: (error) => {
      console.error('Error updating academic record:', error);
      toast.error('Failed to update academic record');
    },
  });

  const deleteAcademicRecord = useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await supabase
        .from('mentee_academic_records')
        .delete()
        .eq('id', recordId);
      
      if (error) throw error;
      return recordId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentee-academic-records'] });
      toast.success('Academic record deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting academic record:', error);
      toast.error('Failed to delete academic record');
    },
  });

  return { 
    addProject, 
    updateProject, 
    deleteProject,
    addAcademicRecord,
    updateAcademicRecord,
    deleteAcademicRecord
  };
}
