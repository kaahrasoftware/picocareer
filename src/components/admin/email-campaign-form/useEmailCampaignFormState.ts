import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ContentType } from "./utils";
import type { Campaign } from "@/types/database/email";

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

export function useEmailCampaignFormState(adminId: string, onCampaignCreated: () => void) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [recipients, setRecipients] = useState<{ id: string; email: string; full_name: string }[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);

  const form = useForm<CampaignFormValues>({
    defaultValues: {
      name: "",
      subject: "",
      content_type: "scholarships",
      recipient_type: "all",
      recipient_ids: [],
      content_ids: [],
      scheduled_for: null,
      frequency: "once",
    },
  });

  const { watch, setValue, reset } = form;

  const loadRecipients = useCallback(async () => {
    if (!form.recipient_type) return;

    if (form.recipient_type === "selected") {
      // Handle selected recipients - no need to load unless we use a query
      return;
    }
    
    const baseQuery = supabase.from("profiles").select("id, email, first_name, last_name, full_name, avatar_url, user_type");
    let query = baseQuery;
    
    // Filter by user type
    if (form.recipient_type === "mentees") {
      query = baseQuery.eq("user_type", "mentee");
    } else if (form.recipient_type === "mentors") {
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
  }, [form.recipient_type]);

  const { data: contentList, isLoading: loadingContent } = useQuery({
    queryKey: ["content-list", watch("content_type")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(watch("content_type"))
        .select("id, title");

      if (error) {
        console.error("Error fetching content:", error);
        return [];
      }
      return data || [];
    },
  });

  const handleRecipientTypeChange = useCallback(
    (type: "all" | "mentees" | "mentors" | "selected") => {
      setValue("recipient_type", type);
      setSelectedRecipientIds([]); // Clear selected IDs when recipient type changes
    },
    [setValue]
  );

  const handleContentSelectionChange = (contentIds: string[]) => {
    setValue("content_ids", contentIds);
  };

  const handleSelectedRecipientsChange = (ids: string[]) => {
    setSelectedRecipientIds(ids);
    setValue("recipient_ids", ids);
  };

  const scheduleCampaign = async (values: CampaignFormValues) => {
    setIsScheduling(true);
    try {
      const campaignData: Omit<Campaign, "id" | "created_at" | "updated_at"> = {
        admin_id: adminId,
        name: values.name,
        subject: values.subject,
        content_type: values.content_type,
        recipient_type: values.recipient_type,
        recipient_ids: values.recipient_type === "selected" ? selectedRecipientIds : [],
        content_ids: values.content_ids,
        scheduled_for: values.scheduled_for?.toISOString() || null,
        sent_at: null,
        sent_count: 0,
        recipients_count: recipients.length,
        failed_count: 0,
        last_error: null,
        last_checked_at: null,
        frequency: values.frequency,
      };

      const { data, error } = await supabase.from("email_campaigns").insert([campaignData]);

      if (error) {
        console.error("Error scheduling campaign:", error);
        alert("Could not schedule campaign. Please try again.");
        return;
      }

      reset();
      onCampaignCreated();
      alert("Campaign scheduled successfully!");
    } finally {
      setIsScheduling(false);
    }
  };

  return {
    form,
    contentList,
    recipients,
    selectedRecipientIds,
    isScheduling,
    loadingContent,
    handleRecipientTypeChange,
    handleContentSelectionChange,
    handleSelectedRecipientsChange,
    scheduleCampaign,
    loadRecipients
  };
}
