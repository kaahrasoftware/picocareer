import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SessionTypeCard } from "./session-type/SessionTypeCard";
import { SessionTypeForm } from "./session-type/SessionTypeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { SessionTypeEnum } from "@/types/session";
import type { MeetingPlatform } from "@/types/calendar";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

interface SessionTypeManagerProps {
  profileId: string;
  sessionTypes: SessionType[];
  onUpdate: () => void;
}

export function SessionTypeManager({ profileId, sessionTypes = [], onUpdate }: SessionTypeManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fetchedSessionTypes = [], isLoading } = useQuery({
    queryKey: ['mentor-session-types', profileId],
    queryFn: async () => {
      console.log('Fetching session types for profile:', profileId);
      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw error;
      console.log('Fetched session types:', data);
      return data;
    },
    enabled: !!profileId
  });

  const handleAddSessionType = async (data: {
    type: SessionTypeEnum;
    duration: string;
    price: string;
    description: string;
    meeting_platform: MeetingPlatform[];
    telegram_username?: string;
    phone_number?: string;
  }) => {
    try {
      console.log('Attempting to add session type:', data);
      
      // Check if this specific session type already exists for this mentor
      const { data: existingTypes, error: checkError } = await supabase
        .from('mentor_session_types')
        .select('id, type')
        .eq('profile_id', profileId)
        .eq('type', data.type)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing types:', checkError);
        throw checkError;
      }

      console.log('Existing types check result:', existingTypes);

      if (existingTypes) {
        console.log('Found existing session type:', existingTypes);
        toast({
          title: "Session type exists",
          description: `You already have a "${data.type}" session type configured.`,
          variant: "destructive",
        });
        return;
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

      console.log('Attempting to insert session type with data:', sessionTypeData);

      const { data: insertedData, error: insertError } = await supabase
        .from('mentor_session_types')
        .insert(sessionTypeData)
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        if (insertError.code === '23505') {
          toast({
            title: "Session type exists",
            description: `You already have a "${data.type}" session type configured.`,
            variant: "destructive",
          });
          return;
        }
        throw insertError;
      }

      console.log('Successfully inserted session type:', insertedData);

      toast({
        title: "Success",
        description: "Session type added successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ['mentor-session-types'] });
      setShowForm(false);
    } catch (error: any) {
      console.error('Error adding session type:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add session type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSessionType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mentor_session_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session type deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['mentor-session-types'] });
    } catch (error) {
      console.error('Error deleting session type:', error);
      toast({
        title: "Error",
        description: "Failed to delete session type",
        variant: "destructive",
      });
    }
  };

  // Get list of existing session types for this mentor
  const existingTypes = fetchedSessionTypes.map(st => st.type);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-[200px] border-dashed flex flex-col gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-6 w-6" />
          Add Session Type
        </Button>
        {fetchedSessionTypes.map((sessionType) => (
          <SessionTypeCard
            key={sessionType.id}
            sessionType={sessionType}
            onDelete={handleDeleteSessionType}
          />
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Session Type</DialogTitle>
            <DialogDescription>
              Configure a new type of mentoring session that mentees can book with you.
            </DialogDescription>
          </DialogHeader>
          <SessionTypeForm
            onSubmit={handleAddSessionType}
            onCancel={() => setShowForm(false)}
            existingTypes={existingTypes}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}