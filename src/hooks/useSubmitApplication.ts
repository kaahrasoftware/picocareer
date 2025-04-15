
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const submitApplication = async (applicationData: {
    opportunity_id: string;
    profile_id: string;
    notes?: string;
  }) => {
    const { data, error } = await supabase
      .from('opportunity_applications')
      .insert(applicationData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error submitting application: ${error.message}`);
    }

    // Update the applications count for the opportunity
    try {
      const { data: opportunity } = await supabase
        .from('opportunities')
        .select('applications_count')
        .eq('id', applicationData.opportunity_id)
        .single();

      await supabase
        .from('opportunities')
        .update({ applications_count: (opportunity.applications_count || 0) + 1 })
        .eq('id', applicationData.opportunity_id);
    } catch (updateError) {
      console.error("Failed to update applications count:", updateError);
    }

    return data;
  };

  const mutation = useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({
        title: "Application Submitted",
        description: "Your application was submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    submitApplication: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
