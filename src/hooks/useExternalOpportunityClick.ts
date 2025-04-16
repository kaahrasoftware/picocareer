
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Session } from "@supabase/supabase-js";

export function useExternalOpportunityClick(opportunityId: string | undefined, applicationUrl: string | null) {
  const [clickLoading, setClickLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleExternalClick = async (session: Session | null) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to check out this opportunity",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      setClickLoading(true);
      
      // Record the click using our database function
      const { data, error } = await supabase
        .rpc('handle_opportunity_click', { p_opportunity_id: opportunityId })
        .single();

      if (error) {
        console.error("Error recording click:", error);
        toast({
          title: "Error",
          description: "There was an issue registering your interest",
          variant: "destructive",
        });
      } else {
        // Invalidate the opportunity query to refresh the analytics data
        queryClient.invalidateQueries({ queryKey: ['opportunity', opportunityId] });
      }

      // Still open the link even if tracking fails
      if (applicationUrl) {
        window.open(applicationUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error("Error recording click:", error);
    } finally {
      setClickLoading(false);
    }
  };

  return {
    clickLoading,
    handleExternalClick
  };
}
