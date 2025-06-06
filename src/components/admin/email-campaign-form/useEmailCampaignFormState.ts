
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmailCampaignSchema } from "./emailCampaign.schema";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseEmailCampaignFormStateOptions {
  onSuccess?: (campaignId: string) => void;
  specificRecipientType?: string;
}

export function useEmailCampaignFormState(options: UseEmailCampaignFormStateOptions = {}) {
  const form = useForm({
    resolver: zodResolver(EmailCampaignSchema),
    defaultValues: {
      content_type: "",
      recipient_type: "all",
      frequency: "once",
      content_ids: [],
      subject: "",
      body: "",
      scheduled_for: "",
      recipient_filter: {},
      specific_recipient_type: "profiles"
    }
  });

  const { data: availableRecipients = [], isLoading: isFetchingRecipients } = useQuery({
    queryKey: ['email-recipients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email');
      
      if (error) throw error;
      return data || [];
    }
  });

  return {
    form,
    isValid: form.formState.isValid,
    setValue: form.setValue,
    availableRecipients,
    isFetchingRecipients,
    specificRecipientType: form.watch('specific_recipient_type')
  };
}

export type UseEmailCampaignFormStateReturn = ReturnType<typeof useEmailCampaignFormState>;
