import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SessionTypeForm } from "./session-type/SessionTypeForm";
import { SessionTypeCard } from "./session-type/SessionTypeCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionTypeEnum } from "@/types/session";
import type { MeetingPlatform } from "@/types/calendar";

interface SessionTypeManagerProps {
  profileId: string;
  onUpdate: () => void;
}

export function SessionTypeManager({ profileId, onUpdate }: SessionTypeManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: sessionTypes = [] } = useQuery({
    queryKey: ['session-types', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', profileId);

      if (error) {
        console.error('Error fetching session types:', error);
        throw error;
      }

      return data;
    },
  });

  const handleSubmit = async (data: {
    type: SessionTypeEnum;
    duration: string;
    price: string;
    description: string;
    meeting_platform: MeetingPlatform[];
    telegram_username?: string;
    phone_number?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('mentor_session_types')
        .insert({
          profile_id: profileId,
          type: data.type,
          duration: parseInt(data.duration),
          price: parseFloat(data.price),
          description: data.description,
          meeting_platform: data.meeting_platform,
          telegram_username: data.telegram_username,
          phone_number: data.phone_number,
        });

      if (error) throw error;

      setIsDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error creating session type:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsDialogOpen(true)}>
        Add Session Type
      </Button>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessionTypes.map((sessionType) => (
          <SessionTypeCard
            key={sessionType.id}
            sessionType={sessionType}
            onDelete={onUpdate}
          />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <SessionTypeForm
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            existingTypes={sessionTypes.map(st => st.type)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}