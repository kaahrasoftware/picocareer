import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { SessionTypeCard } from "./session-type/SessionTypeCard";
import { SessionTypeForm } from "./session-type/SessionTypeForm";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

interface SessionTypeManagerProps {
  profileId: string;
  sessionTypes: SessionType[];
  onUpdate: () => void;
}

export function SessionTypeManager({ profileId, sessionTypes, onUpdate }: SessionTypeManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddSessionType = async (data: {
    type: Database["public"]["Enums"]["session_type"];
    duration: string;
    price: string;
    description: string;
  }) => {
    try {
      const { error } = await supabase
        .from('mentor_session_types')
        .insert({
          profile_id: profileId,
          type: data.type,
          duration: parseInt(data.duration),
          price: parseInt(data.price),
          description: data.description
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session type added successfully",
      });
      
      onUpdate();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding session type:', error);
      toast({
        title: "Error",
        description: "Failed to add session type",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSessionType = async (sessionTypeId: string) => {
    try {
      const { error } = await supabase
        .from('mentor_session_types')
        .delete()
        .eq('id', sessionTypeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session type removed successfully",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error deleting session type:', error);
      toast({
        title: "Error",
        description: "Failed to remove session type",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessionTypes.map((sessionType) => (
            <SessionTypeCard
              key={sessionType.id}
              sessionType={sessionType}
              onDelete={handleDeleteSessionType}
            />
          ))}
          <Button
            variant="outline"
            className="h-[200px] border-dashed flex flex-col gap-2"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-6 w-6" />
            Add Session Type
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Session Type</DialogTitle>
            </DialogHeader>
            <SessionTypeForm
              onSubmit={handleAddSessionType}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}