import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { MeetingPlatform } from "@/types/calendar";
import type { SessionTypeEnum } from "@/types/session";

interface SessionTypeData {
  type: SessionTypeEnum;
  duration: string;
  price: string;
  description: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
}

export function useSessionTypeSubmit(profileId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: SessionTypeData) => {
    try {
      console.log('Attempting to add session type:', data);
      
      const { data: existingType, error: checkError } = await supabase
        .from('mentor_session_types')
        .select('id, type')
        .eq('profile_id', profileId)
        .eq('type', data.type)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing types:', checkError);
        throw checkError;
      }

      console.log('Existing type check result:', existingType);

      if (existingType) {
        console.log('Found existing session type:', existingType);
        toast({
          title: "Session type exists",
          description: `You already have a "${data.type}" session type configured.`,
          variant: "destructive",
        });
        return false;
      }

      const sessionTypeData = {
        profile_id: profileId,
        type: data.type,
        duration: parseInt(data.duration),
        price: 0.00,
        description: data.description || null,
        meeting_platform: data.meeting_platform,
        telegram_username: data.telegram_username || null,
        phone_number: data.phone_number || null
      };

      const { error: insertError } = await supabase
        .from('mentor_session_types')
        .insert(sessionTypeData)
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      toast({
        title: "Success",
        description: "Session type added successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ['mentor-session-types'] });
      return true;
    } catch (error: any) {
      console.error('Error adding session type:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add session type. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleSubmit };
}