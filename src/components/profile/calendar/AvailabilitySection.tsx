import { useState } from "react";
import { AvailabilityManager } from "../mentor/AvailabilityManager";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AvailabilitySectionProps {
  profileId: string;
}

export function AvailabilitySection({ profileId }: AvailabilitySectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAvailabilityUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['session-events'] });
    toast({
      title: "Availability updated",
      description: "Your availability has been successfully updated.",
    });
  };

  return (
    <div className="mt-6">
      <AvailabilityManager
        profileId={profileId}
        onUpdate={handleAvailabilityUpdate}
      />
    </div>
  );
}