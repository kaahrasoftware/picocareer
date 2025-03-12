
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { updateMentorTimezoneOffsets } from "@/utils/timezoneUpdater";

export function useTimezoneUpdate() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateMentorTimezoneOffsets,
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Timezones Updated",
          description: `Successfully updated ${result.updatedCount} mentor timezone offsets.${result.errors ? ' Some updates failed.' : ''}`,
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
}
