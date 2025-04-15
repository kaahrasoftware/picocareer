
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createOpportunity = async (opportunityData: any) => {
    const { data, error } = await supabase
      .from('opportunities')
      .insert(opportunityData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating opportunity: ${error.message}`);
    }

    return data;
  };

  const mutation = useMutation({
    mutationFn: createOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({
        title: "Opportunity Created",
        description: "Your opportunity was created successfully and is pending approval",
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
    createOpportunity: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
