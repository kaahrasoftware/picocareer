import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SessionType {
  id: string;
  type: string;
  duration: number;
  price: number;
  description: string | null;
}

export function useSessionTypes(mentorId: string, isOpen: boolean) {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSessionTypes() {
      if (!mentorId) {
        toast({
          title: "Error",
          description: "Invalid mentor ID",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', mentorId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load session types",
          variant: "destructive",
        });
        return;
      }

      setSessionTypes(data);
    }

    if (isOpen && mentorId) {
      fetchSessionTypes();
    }
  }, [mentorId, isOpen, toast]);

  return sessionTypes;
}