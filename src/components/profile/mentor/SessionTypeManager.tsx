import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SessionTypeForm } from "./session-type/SessionTypeForm";
import { SessionTypeCard } from "./session-type/SessionTypeCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SessionTypeEnum } from "@/types/session";
import type { MeetingPlatform } from "@/types/calendar";

interface SessionTypeManagerProps {
  profileId: string;
  sessionTypes: any[];
  onUpdate: () => void;
}

export function SessionTypeManager({ profileId, sessionTypes, onUpdate }: SessionTypeManagerProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

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
      const { error } = await supabase.from('mentor_session_types').insert({
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

      toast({
        title: "Success",
        description: "Session type added successfully",
      });

      setOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
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

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const existingTypes = sessionTypes.map(type => type.type);

  return (
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)}>Add Session Type</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Session Type</DialogTitle>
          </DialogHeader>
          <SessionTypeForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            existingTypes={existingTypes}
          />
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2">
        {sessionTypes.map((sessionType) => (
          <SessionTypeCard
            key={sessionType.id}
            sessionType={sessionType}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}