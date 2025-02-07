
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePersonalitySubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: { [key: string]: string }) => {
    try {
      setIsSubmitting(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error. Please sign in again.');
      }

      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to take the personality test.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const responses = Object.entries(data).map(([questionId, answer]) => ({
        profile_id: session.user.id,
        question_id: questionId,
        answer: String(answer)
      }));

      const { error: responseError } = await supabase
        .from('personality_test_responses')
        .insert(responses);

      if (responseError) throw responseError;

      const { data: analysis, error: analysisError } = await supabase.functions
        .invoke('analyze-personality', {
          body: {
            responses: data,
            profileId: session.user.id
          }
        });

      if (analysisError) throw analysisError;

      toast({
        title: "Test Completed",
        description: "Your personality test has been analyzed successfully.",
      });

      navigate('/personality-test?tab=results');

    } catch (error: any) {
      console.error('Error submitting test:', error);
      
      if (error.message?.includes('session expired') || error.message?.includes('sign in')) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      toast({
        title: "Error",
        description: error.message || "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
}
