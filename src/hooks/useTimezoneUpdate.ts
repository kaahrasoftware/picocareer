
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
        
        // Show additional toast with detailed counts if there were errors
        if (result.errors && result.errors.length > 0) {
          toast({
            title: "Update Details",
            description: `Updated ${result.updatedCount} slots successfully. ${result.errors.length} errors occurred. Check console for details.`,
            variant: "warning",
          });
          console.log("Timezone update errors:", result.errors);
        }
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
      
      if (result.error) {
        toast({
          title: "Timezone Check Failed",
          description: `Error: ${result.error}`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Timezone Debug Info",
        description: `Timezone: ${result.timezone}\nCalculated offset: ${result.offsetMinutes} minutes\nAlternate method: ${result.alternateOffset} minutes\nDST active: ${result.isDST ? 'Yes' : 'No'}`,
      });
    }
  });

  return {
    updateTimezones,
    debugTimezone
  };
}
