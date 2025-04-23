
import React from "react";
import { ContentType, CONTENT_TYPE_LABELS } from "./utils";

interface EmailPreviewProps {
  selectedContentIds: string[];
  contentList: {id: string, title: string}[];
  contentType: ContentType;
}

function getEmailTemplate(contentItems: {id: string, title: string}[], contentType: ContentType) {
  const label = CONTENT_TYPE_LABELS[contentType];
  const title = contentItems.length > 1 
    ? `${label}: ${contentItems.length} Items` 
    : `${label}: ${contentItems[0]?.title || 'No title'}`;
  
  return (
    <div className="p-4 border rounded bg-white">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p>Hello!</p>
      <p className="mb-6">
        We're excited to share these {contentType} with you!
      </p>
      
      <div className="space-y-4">
        {contentItems.map(content => (
          <div key={content.id} className="border p-3 rounded">
            <h3 className="font-semibold">{content.title}</h3>
            <p className="text-sm text-muted-foreground">
              Learn more about this {contentType.slice(0, -1)} on our platform.
            </p>
          </div>
        ))}
      </div>
      
      <p className="mt-6 text-sm">
        Visit PicoCareer to discover more opportunities!
      </p>
      <p className="italic text-sm">— The PicoCareer Team</p>
    </div>
  );
}

export function EmailPreview({ selectedContentIds, contentList, contentType }: EmailPreviewProps) {
  const selectedContents = contentList.filter(content => selectedContentIds.includes(content.id));
  
  return (
    <div>
      <label className="block font-medium mb-1">Email Preview</label>
      <div className="border bg-muted rounded px-3 py-4 text-sm">
        {selectedContentIds.length === 0
          ? "(Nothing selected)"
          : getEmailTemplate(selectedContents, contentType)
        }
      </div>
    </div>
  );
}
