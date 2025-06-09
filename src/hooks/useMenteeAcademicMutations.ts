
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MenteeAcademicRecord } from "@/types/mentee-profile";

interface AcademicRecordInput {
  mentee_id: string;
  semester: string;
  year: number;
  semester_gpa?: number;
  cumulative_gpa?: number;
  credits_attempted?: number;
  credits_earned?: number;
  class_rank?: number;
  honors?: string[];
  awards?: string[];
}

export function useMenteeAcademicMutations() {
  const queryClient = useQueryClient();

  const addAcademicRecord = useMutation({
    mutationFn: async (record: AcademicRecordInput) => {
      const { data, error } = await supabase
        .from("mentee_academic_records")
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mentee-academic-records", data.mentee_id] });
      toast.success("Academic record added successfully");
    },
    onError: (error) => {
      console.error("Error adding academic record:", error);
      toast.error("Failed to add academic record");
    },
  });

  const updateAcademicRecord = useMutation({
    mutationFn: async ({ id, ...record }: AcademicRecordInput & { id: string }) => {
      const { data, error } = await supabase
        .from("mentee_academic_records")
        .update(record)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mentee-academic-records", data.mentee_id] });
      toast.success("Academic record updated successfully");
    },
    onError: (error) => {
      console.error("Error updating academic record:", error);
      toast.error("Failed to update academic record");
    },
  });

  const deleteAcademicRecord = useMutation({
    mutationFn: async ({ id, menteeId }: { id: string; menteeId: string }) => {
      const { error } = await supabase
        .from("mentee_academic_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, menteeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mentee-academic-records", data.menteeId] });
      toast.success("Academic record deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting academic record:", error);
      toast.error("Failed to delete academic record");
    },
  });

  return {
    addAcademicRecord,
    updateAcademicRecord,
    deleteAcademicRecord,
  };
}
