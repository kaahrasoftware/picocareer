
import React from "react";
import { ContentType, CONTENT_TYPE_LABELS } from "./utils";
import { getContentTypeStyles } from "../../../utils/email-templates/styles";
import { formatContentCard } from "../../../utils/email-templates/content-cards";
import { generateBaseTemplate } from "../../../utils/email-templates/base-template";
import { generateContentHeader } from "../../../utils/email-templates/content-header";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
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

        // Cast and merge with default values for the type
        const defaultLayoutSettings = {
          headerStyle: 'centered' as const,
          showAuthor: true,
          showDate: true,
          imagePosition: 'top' as const,
          contentBlocks: ['title', 'image', 'description', 'cta'] as string[],
          metadataDisplay: ['category', 'date', 'author'] as string[]
        };

        // Return properly typed settings object
        if (globalSettings) {
          return {
            id: globalSettings.id,
            admin_id: globalSettings.admin_id,
            content_type: contentType,
            primary_color: globalSettings.primary_color || "#4f46e5",
            secondary_color: globalSettings.secondary_color || "#3730a3",
            accent_color: globalSettings.accent_color || "#4f46e5",
            layout_settings: defaultLayoutSettings,
            created_at: globalSettings.created_at,
            updated_at: globalSettings.updated_at
          } as EmailContentTypeSettings;
        }
        
        // Fallback default values
        return {
          id: '',
          admin_id: '',
          content_type: contentType,
          primary_color: "#4f46e5",
          secondary_color: "#3730a3",
          accent_color: "#4f46e5",
          layout_settings: defaultLayoutSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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

  // Generate preview content with error handling
  let previewHtml = '';
  let errorMessage = '';
  
  try {
    if (selectedContents.length === 0) {
      previewHtml = '<div class="text-center p-4 text-gray-500">No content selected for preview</div>';
    } else {
      // Make sure we have the necessary data before generating the email
      const styles = templateSettings ? {
        primary: templateSettings.primary_color,
        secondary: templateSettings.secondary_color,
        accent: templateSettings.accent_color
      } : getContentTypeStyles(contentType);
      
      // Calculate total amount for scholarships
      const totalAmount = contentType === 'scholarships' 
        ? calculateTotalAmount(selectedContents)
        : undefined;

      // Generate header
      const header = generateContentHeader(contentType, totalAmount, "Preview User", styles);
      
      // Generate content cards HTML
      let contentCardsHtml = '';
      selectedContents.forEach(item => {
        // Note fixed parameter order: item, contentType, siteUrl, styles, layoutSettings
        contentCardsHtml += formatContentCard(
          item, 
          contentType, 
          window.location.origin,
          styles,
          templateSettings?.layout_settings
        );
      });
      
      // Generate main content with header
      const mainContent = `
        ${header}
        
        <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          ${contentCardsHtml}
        </div>
      `;
      
      // Generate complete email using base template
      previewHtml = generateBaseTemplate(
        mainContent, 
        window.location.origin, 
        window.location.origin + "/unsubscribe?campaign=preview", 
        styles, 
        templateSettings?.logo_url
      );
    }
  } catch (error) {
    console.error("Error generating email preview:", error);
    errorMessage = String(error);
    previewHtml = `<div class="text-center p-4 text-red-500">Error generating preview</div>`;
  }
  
  return (
    <div>
      <label className="block font-medium mb-1">Email Preview</label>
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error generating preview: {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="border bg-muted rounded px-3 py-4 text-sm overflow-auto max-h-[500px]">
        {selectedContentIds.length === 0 ? (
          <div className="text-center p-4 text-gray-500">(Nothing selected)</div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        )}
      </div>
    </div>
  );
  
  // Helper function for calculating total scholarship amount
  function calculateTotalAmount(contentItems: ContentItem[]): string {
    const total = contentItems.reduce((sum, item) => {
      const amount = typeof item.amount === 'number' ? item.amount : 0;
      return sum + amount;
    }, 0);

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(total);
  }
}
