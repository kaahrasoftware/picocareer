import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MeetingPlatform } from "@/types/calendar";

interface SessionType {
  id: string;
  type: string;
  duration: number;
  price: number;
  description: string | null;
  meeting_platform: MeetingPlatform[];
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
      console.log("Fetching session types for mentor:", mentorId);
      
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

      console.log("Fetched session types:", data);
      setSessionTypes(data);
    }

    if (isOpen && mentorId) {
      fetchSessionTypes();
    }
  }, [mentorId, isOpen, toast]);

  return sessionTypes;
}