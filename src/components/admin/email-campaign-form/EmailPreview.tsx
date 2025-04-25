
import React from "react";
import { ContentType, CONTENT_TYPE_LABELS } from "./utils";
import { generateEmailContent } from "../../../utils/email-templates";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmailContentTypeSettings } from "@/types/database/email";

interface EmailPreviewProps {
  selectedContentIds: string[];
  contentList: {id: string, title: string}[];
  contentType: ContentType;
}

export function EmailPreview({ selectedContentIds, contentList, contentType }: EmailPreviewProps) {
  // Fetch template settings for this content type
  const { data: templateSettings, isLoading: loadingSettings } = useQuery({
    queryKey: ['email-template-settings', contentType],
    queryFn: async () => {
      // First try to get content type specific settings
      const { data: contentTypeSettings, error: contentTypeError } = await supabase
        .from('email_content_type_settings')
        .select('*')
        .eq('content_type', contentType)
        .single();

      if (contentTypeSettings) {
        return contentTypeSettings as EmailContentTypeSettings;
      }

      // If no content type specific settings, fall back to global template settings
      const { data: globalSettings, error: globalError } = await supabase
        .from('email_template_settings')
        .select('*')
        .single();

      if (globalError && globalError.code !== 'PGRST116') {
        throw globalError;
      }

      return globalSettings as EmailContentTypeSettings;
    }
  });

  const selectedContents = contentList.filter(content => selectedContentIds.includes(content.id));

  if (loadingSettings) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  const previewHtml = generateEmailContent(
    CONTENT_TYPE_LABELS[contentType],
    `Check out these featured ${contentType}!`,
    "Preview User",
    "preview-campaign-id",
    selectedContents,
    contentType,
    window.location.origin,
    templateSettings
  );
  
  return (
    <div>
      <label className="block font-medium mb-1">Email Preview</label>
      <div className="border bg-muted rounded px-3 py-4 text-sm overflow-auto max-h-[500px]">
        {selectedContentIds.length === 0 ? (
          "(Nothing selected)"
        ) : (
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        )}
      </div>
    </div>
  );
}
