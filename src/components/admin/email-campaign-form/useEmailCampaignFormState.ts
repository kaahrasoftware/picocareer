
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ContentType } from "./utils";
import type { Campaign } from "@/types/database/email";
import { toast } from "sonner";

interface CampaignFormValues {
  subject: string;
  content_type: ContentType;
  recipient_type: "all" | "mentees" | "mentors" | "selected";
  recipient_ids: string[];
  content_ids: string[];
  scheduled_for: Date | null;
  frequency: "once" | "daily" | "weekly" | "monthly";
}

export function useEmailCampaignFormState(
  adminId: string,
  contentType: ContentType,
  onCampaignCreated: () => void
) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [recipients, setRecipients] = useState<{ id: string; email: string; full_name: string }[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [recipientType, setRecipientType] = useState<"all" | "mentees" | "mentors" | "selected">("all");

  const { data: contentList, isLoading } = useQuery({
    queryKey: ["content-list", contentType],
    queryFn: async () => {
      if (!contentType) return [];

      let query;
      
      if (contentType === 'mentors') {
        query = supabase
          .from('profiles')
          .select('id, full_name as title')
          .eq('user_type', 'mentor');
      } else {
        query = supabase
          .from(contentType)
          .select('id, title');
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching content:", error);
        return [];
      }

      return data || [];
    },
  });

  const loadRecipients = useCallback(async () => {
    if (!recipientType) return;

    if (recipientType === "selected") {
      return;
    }
    
    const baseQuery = supabase.from("profiles").select("id, email, first_name, last_name, full_name, avatar_url, user_type");
    let query = baseQuery;
    
    if (recipientType === "mentees") {
      query = baseQuery.eq("user_type", "mentee");
    } else if (recipientType === "mentors") {
      query = baseQuery.eq("user_type", "mentor");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching recipients:", error);
      return;
    }

    if (data) {
      setRecipients(
        data.map((profile) => ({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || `${profile.first_name} ${profile.last_name}`,
        }))
      );
    }
  }, [recipientType]);

  const handleRecipientTypeChange = useCallback(
    (type: "all" | "mentees" | "mentors" | "selected") => {
      setRecipientType(type);
      setSelectedRecipientIds([]);
      loadRecipients();
    },
    [loadRecipients]
  );

  const handleContentSelectionChange = (contentIds: string[]) => {
    return contentIds;
  };

  const handleSelectedRecipientsChange = (ids: string[]) => {
    setSelectedRecipientIds(ids);
  };

  const validateFormValues = (values: CampaignFormValues): string | null => {
    console.log("Validating form values:", values);

    if (!values.subject.trim()) {
      return "Subject is required";
    }
    if (!values.content_ids.length) {
      return "Please select at least one content item";
    }
    if (values.recipient_type === "selected" && !values.recipient_ids.length) {
      return "Please select at least one recipient";
    }
    if (!values.scheduled_for) {
      return "Please select a scheduled date and time";
    }
    if (values.scheduled_for <= new Date()) {
      return "Scheduled time must be in the future";
    }
    return null;
  };

  const scheduleCampaign = async (values: CampaignFormValues) => {
    console.log("Attempting to schedule campaign with values:", values);
    setIsScheduling(true);

    try {
      const validationError = validateFormValues(values);
      if (validationError) {
        throw new Error(validationError);
      }

      const recipientsCount = values.recipient_type === "selected" 
        ? values.recipient_ids.length 
        : recipients.length;

      console.log("Calculated recipients count:", recipientsCount);

      const campaignData = {
        admin_id: adminId,
        subject: values.subject,
        content_type: values.content_type,
        recipient_type: values.recipient_type,
        recipient_filter: values.recipient_type === "selected" 
          ? { profile_ids: values.recipient_ids }
          : null,
        recipient_ids: values.recipient_type === "selected" ? values.recipient_ids : [],
        content_ids: values.content_ids,
        content_id: values.content_ids[0], // Keep first ID for backward compatibility
        scheduled_for: values.scheduled_for?.toISOString(),
        sent_at: null,
        sent_count: 0,
        recipients_count: recipientsCount,
        failed_count: 0,
        status: "pending",
        frequency: values.frequency,
      } as const;

      console.log("Submitting campaign data:", campaignData);

      const { data, error } = await supabase
        .from("email_campaigns")
        .insert(campaignData)
        .select("id")
        .single();

      if (error) {
        console.error("Database error:", error);
        throw new Error(error.message);
      }

      console.log("Campaign created successfully:", data);
      toast.success("Campaign scheduled successfully!");
      onCampaignCreated();
      return data;
    } catch (error: any) {
      console.error("Error scheduling campaign:", error);
      toast.error(error.message || "Could not schedule campaign. Please try again.");
      throw error;
    } finally {
      setIsScheduling(false);
    }
  };

  return {
    contentList,
    recipients,
    selectedRecipientIds,
    isScheduling,
    isLoading,
    handleRecipientTypeChange,
    handleContentSelectionChange,
    handleSelectedRecipientsChange,
    scheduleCampaign,
    loadRecipients
  };
}
