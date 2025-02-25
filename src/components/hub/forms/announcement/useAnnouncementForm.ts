
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormFields, AnnouncementFormProps } from "./types";

export function useAnnouncementForm({ 
  hubId, 
  onSuccess, 
  existingAnnouncement 
}: AnnouncementFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FormFields>({
    defaultValues: {
      title: existingAnnouncement?.title || "",
      content: existingAnnouncement?.content || "",
      category: existingAnnouncement?.category || "general",
      scheduled_for: existingAnnouncement?.scheduled_for || "",
      expires_at: existingAnnouncement?.expires_at || "",
      target_audience: existingAnnouncement?.target_audience || [],
      cover_image_url: existingAnnouncement?.cover_image_url || ""
    }
  });

  const onSubmit = async (data: FormFields) => {
    try {
      console.log("Submitting announcement form with data:", data);
      
      const cleanedData = {
        ...data,
        scheduled_for: data.scheduled_for?.trim() || null,
        expires_at: data.expires_at?.trim() || null,
        hub_id: hubId,
      };

      console.log("Cleaned data for submission:", cleanedData);

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error("No authenticated user found");
      }

      if (existingAnnouncement) {
        console.log("Updating existing announcement:", existingAnnouncement.id);
        const { error } = await supabase
          .from('hub_announcements')
          .update({
            ...cleanedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAnnouncement.id);

        if (error) throw error;
      } else {
        console.log("Creating new announcement for hub:", hubId);
        const { error } = await supabase
          .from('hub_announcements')
          .insert({
            ...cleanedData,
            hub_id: hubId,
            created_by: user.id
          });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
      }

      toast({
        title: "Success",
        description: `Announcement ${existingAnnouncement ? 'updated' : 'created'} successfully.`
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: "Error",
        description: "Failed to save announcement. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { form, onSubmit };
}
