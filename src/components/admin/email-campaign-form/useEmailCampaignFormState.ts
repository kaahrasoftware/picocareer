import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ContentType } from "./utils";
import type { Campaign } from "@/types/database/email";
import { toast } from "sonner";

interface CampaignFormValues {
  name: string;
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
    },
    []
  );

  const handleContentSelectionChange = (contentIds: string[]) => {
    return contentIds;
  };

  const handleSelectedRecipientsChange = (ids: string[]) => {
    setSelectedRecipientIds(ids);
  };

  const scheduleCampaign = async (values: CampaignFormValues) => {
    setIsScheduling(true);
    try {
      if (!values.subject.trim()) {
        throw new Error("Subject is required");
      }
      if (!values.content_ids.length) {
        throw new Error("Please select at least one content item");
      }
      if (values.recipient_type === "selected" && !values.recipient_ids.length) {
        throw new Error("Please select at least one recipient");
      }
      if (!values.scheduled_for) {
        throw new Error("Please select a scheduled date and time");
      }

      const recipientsCount = values.recipient_type === "selected" 
        ? values.recipient_ids.length 
        : recipients.length;

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
        content_id: values.content_ids[0],
        scheduled_for: values.scheduled_for?.toISOString(),
        sent_at: null,
        sent_count: 0,
        recipients_count: recipientsCount,
        failed_count: 0,
        status: "pending",
        frequency: values.frequency,
      } as const;

      const { data, error } = await supabase
        .from("email_campaigns")
        .insert(campaignData);

      if (error) {
        throw error;
      }

      toast.success("Campaign scheduled successfully!");
      onCampaignCreated();
    } catch (error: any) {
      console.error("Error scheduling campaign:", error);
      toast.error(error.message || "Could not schedule campaign. Please try again.");
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
