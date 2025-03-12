
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { updateMentorTimezoneOffsets, getTimezoneOffsetForDebugging } from "@/utils/timezoneUpdater";

export function useTimezoneUpdate() {
  const { toast } = useToast();

  const checkTimezone = async (timezone) => {
    const result = await getTimezoneOffsetForDebugging(timezone);
    return result;
  };

  const updateTimezones = useMutation({
    mutationFn: updateMentorTimezoneOffsets,
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Timezones Updated",
          description: `Successfully updated ${result.updatedCount} mentor timezone offsets. Total DST-aware slots: ${result.totalDSTAwareSlots}.${result.errors ? ' Some updates failed.' : ''}`,
          variant: result.errors ? "warning" : "default",
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update timezone offsets. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error updating timezone offsets:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating timezone offsets.",
        variant: "destructive",
      });
    }
  });

  const debugTimezone = useMutation({
    mutationFn: checkTimezone,
    onSuccess: (result) => {
      console.log('Timezone debug result:', result);
      toast({
        title: "Timezone Check",
        description: `Timezone: ${result.timezone}, Offset: ${result.offsetMinutes} minutes, DST: ${result.isDST ? 'Yes' : 'No'}`,
      });
    }
  });

  return {
    updateTimezones,
    debugTimezone
  };
}
