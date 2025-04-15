
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";

export function useApplyToOpportunity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { session } = useAuthSession();

  const applyToOpportunity = async (opportunityId: string, applicationData: any = {}) => {
    if (!session?.user?.id) {
      throw new Error("You must be logged in to apply for opportunities");
    }

    // Insert application
    const { data, error } = await supabase
      .from('opportunity_applications')
      .insert({
        opportunity_id: opportunityId,
        profile_id: session.user.id,
        application_data: applicationData,
        status: 'Applied'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error applying to opportunity: ${error.message}`);
    }

    // Update analytics - increment applications count
    const { error: analyticsError } = await supabase
      .from('opportunity_analytics')
      .select('id, applications_count')
      .eq('opportunity_id', opportunityId)
      .single();

    if (analyticsError && analyticsError.code !== 'PGRST116') { // Not found is ok
      console.error("Error fetching analytics for update:", analyticsError);
    } else {
      // Try to update existing analytics record
      const { error: updateError } = await supabase.rpc(
        'increment_opportunity_applications_count',
        { opportunity_id: opportunityId }
      );

      if (updateError) {
        console.error("Error updating applications count:", updateError);
      }
    }

    return data;
  };

  const mutation = useMutation({
    mutationFn: (params: { opportunityId: string, applicationData?: any }) => 
      applyToOpportunity(params.opportunityId, params.applicationData),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
      
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
    applyToOpportunity: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
