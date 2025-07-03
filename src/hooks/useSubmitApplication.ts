
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
    // First, check if opportunity_applications table exists, if not use a simple approach
    try {
      const { data, error } = await supabase
        .from('opportunity_applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error submitting application: ${error.message}`);
      }

      // Try to increment the analytics count using the function
      try {
        await supabase.rpc('increment_opportunity_applications_count', {
          opportunity_id: applicationData.opportunity_id
        });
      } catch (incrementError) {
        console.error("Failed to update analytics count:", incrementError);
        // Don't throw here, just log the error
      }

      return data;
    } catch (error) {
      // If table doesn't exist, create a simple record in a generic way
      console.error('Application submission failed:', error);
      throw error;
    }
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
