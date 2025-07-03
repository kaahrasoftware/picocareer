
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MenteeProject, MenteeAcademicRecord, MenteeEssayResponse, MenteeCourse } from "@/types/mentee-profile";

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
        class_rank: record.class_rank?.toString() || null,
        graduation_date: null, // Not available in current schema
        relevant_coursework: [], // Not available in current schema
        thesis_topic: null, // Not available in current schema
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

export function useMenteeCourses(menteeId: string) {
  return useQuery({
    queryKey: ['mentee-courses', menteeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentee_courses')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []) as MenteeCourse[];
    },
    enabled: !!menteeId,
  });
}

export function useMenteeEssayResponses(menteeId: string) {
  return useQuery({
    queryKey: ['mentee-essay-responses', menteeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentee_essays')
        .select(`
          *,
          prompt:essay_prompts(*)
        `)
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match MenteeEssayResponse interface
      return (data || []).map(essay => ({
        ...essay,
        status: essay.is_draft ? 'draft' : 'completed',
        prompt_id: essay.prompt_id,
        response_text: essay.response_text,
        word_count: essay.word_count,
        feedback: null,
        score: null
      })) as MenteeEssayResponse[];
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

  const addCourse = useMutation({
    mutationFn: async (courseData: Omit<MenteeCourse, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('mentee_courses')
        .insert([courseData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-courses', data.mentee_id] });
      toast.success('Course added successfully');
    },
    onError: (error) => {
      console.error('Error adding course:', error);
      toast.error('Failed to add course');
    },
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<MenteeCourse> & { id: string }) => {
      const { data, error } = await supabase
        .from('mentee_courses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentee-courses', data.mentee_id] });
      toast.success('Course updated successfully');
    },
    onError: (error) => {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('mentee_courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
      return courseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentee-courses'] });
      toast.success('Course deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    },
  });

  const addAcademicRecord = useMutation({
    mutationFn: async (recordData: Omit<MenteeAcademicRecord, 'id' | 'created_at' | 'updated_at'>) => {
      // Map the interface fields to database fields
      const dbData = {
        mentee_id: recordData.mentee_id,
        semester: recordData.semester,
        year: recordData.year,
        cumulative_gpa: recordData.cumulative_gpa,
        semester_gpa: recordData.semester_gpa,
        credits_attempted: recordData.credits_attempted,
        credits_earned: recordData.credits_earned,
        class_rank: recordData.class_rank ? parseInt(recordData.class_rank) : null,
        honors: recordData.honors || [],
        awards: recordData.awards || []
      };
      
      const { data, error } = await supabase
        .from('mentee_academic_records')
        .insert([dbData])
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
      // Map interface fields to database fields
      const dbUpdateData = {
        semester: updateData.semester,
        year: updateData.year,
        cumulative_gpa: updateData.cumulative_gpa,
        semester_gpa: updateData.semester_gpa,
        credits_attempted: updateData.credits_attempted,
        credits_earned: updateData.credits_earned,
        class_rank: updateData.class_rank ? parseInt(updateData.class_rank) : null,
        honors: updateData.honors,
        awards: updateData.awards
      };
      
      const { data, error } = await supabase
        .from('mentee_academic_records')
        .update(dbUpdateData)
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
    addCourse,
    updateCourse,
    deleteCourse,
    addAcademicRecord,
    updateAcademicRecord,
    deleteAcademicRecord
  };
}
