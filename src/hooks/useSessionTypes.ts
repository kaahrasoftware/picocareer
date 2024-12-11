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

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function useSessionTypes(mentorId: string, isOpen: boolean) {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSessionTypes() {
      if (!mentorId || !isValidUUID(mentorId)) {
        console.log("Invalid mentor ID format:", mentorId);
        toast({
          title: "Error",
          description: "Invalid mentor ID format",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', mentorId);

      if (error) {
        console.error("Error fetching session types:", error);
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