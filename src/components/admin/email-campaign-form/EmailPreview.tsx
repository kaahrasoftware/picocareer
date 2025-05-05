
import React from "react";
import { ContentType, CONTENT_TYPE_LABELS } from "./utils";
import { generateEmailContent } from "../../../utils/email-templates";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmailContentTypeSettings, EmailTemplateSettings, ContentItem } from "@/types/database/email";

interface EmailPreviewProps {
  selectedContentIds: string[];
  contentList: ContentItem[];
  contentType: ContentType;
}

export function EmailPreview({ selectedContentIds, contentList, contentType }: EmailPreviewProps) {
  const { data: templateSettings, isLoading: loadingSettings } = useQuery({
    queryKey: ['email-template-settings', contentType],
    queryFn: async () => {
      try {
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
          console.error("Error fetching template settings:", globalError);
          return null;
        }

        // Cast and merge with default values
        return {
          ...globalSettings,
          content_type: contentType,
          primary_color: globalSettings?.primary_color || "#4f46e5",
          secondary_color: globalSettings?.secondary_color || "#3730a3",
          accent_color: globalSettings?.accent_color || "#4f46e5",
          layout_settings: {
            headerStyle: 'centered',
            showAuthor: true,
            showDate: true,
            imagePosition: 'top',
            contentBlocks: ['title', 'image', 'description', 'cta'],
            metadataDisplay: ['category', 'date', 'author']
          }
        } as EmailContentTypeSettings;
      } catch (error) {
        console.error("Error in template settings query:", error);
        return null;
      }
    }
  });

  // Safely select content items from the list
  const selectedContents = React.useMemo(() => {
    if (!Array.isArray(contentList) || !Array.isArray(selectedContentIds)) {
      console.log("Invalid content or selected IDs", { contentList, selectedContentIds });
      return [];
    }
    
    return contentList.filter(content => selectedContentIds.includes(content.id));
  }, [contentList, selectedContentIds]);
  
  console.log("Email Preview Props:", { 
    selectedContentIds, 
    contentType,
    selectedContents: selectedContents.map(c => ({ id: c.id, title: c.title })),
    templateSettings: templateSettings ? {
      primary_color: templateSettings.primary_color,
      layout: templateSettings.layout_settings
    } : 'No template settings'
  });

  if (loadingSettings) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  let previewHtml = '';
  try {
    if (selectedContents.length === 0) {
      previewHtml = '<div>No content selected for preview</div>';
    } else {
      previewHtml = generateEmailContent(
        CONTENT_TYPE_LABELS[contentType] || "Content",
        `Check out these featured ${contentType}!`,
        "Preview User",
        "preview-campaign-id",
        selectedContents,
        contentType,
        window.location.origin,
        templateSettings || undefined
      );
    }
  } catch (error) {
    console.error("Error generating email preview:", error);
    previewHtml = `<div>Error generating preview: ${String(error)}</div>`;
  }
  
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
