
import React from "react";
import { ContentType, CONTENT_TYPE_LABELS } from "./utils";
import { generateEmailContent } from "../../../utils/email-templates";

interface EmailPreviewProps {
  selectedContentIds: string[];
  contentList: {id: string, title: string}[];
  contentType: ContentType;
}

export function EmailPreview({ selectedContentIds, contentList, contentType }: EmailPreviewProps) {
  const selectedContents = contentList.filter(content => selectedContentIds.includes(content.id));
  console.log("Generating email preview with:", {
    selectedContents,
    contentType,
    origin: window.location.origin
  });
  
  const previewHtml = generateEmailContent(
    CONTENT_TYPE_LABELS[contentType],
    `Check out these featured ${contentType}!`,
    "Preview User",
    "preview-campaign-id",
    selectedContents,
    contentType,
    window.location.origin
  );

  console.log("Generated preview HTML:", previewHtml);
  
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
