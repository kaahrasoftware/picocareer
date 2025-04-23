
import React from "react";
import { ContentType, CONTENT_TYPE_LABELS } from "./utils";

interface EmailPreviewProps {
  selectedContentIds: string[];
  contentList: {id: string, title: string}[];
  contentType: ContentType;
}

function getEmailTemplate(content: {id: string, title: string} | undefined, contentType: ContentType) {
  const label = CONTENT_TYPE_LABELS[contentType];
  const previewTitle = content ? `${label}: ${content.title}` : label;
  switch (contentType) {
    default:
      return (
        <div>
          <h2 className="text-lg font-bold mb-1">{previewTitle}</h2>
          <p>Hello!</p>
          <p>
            We're excited to feature this {contentType.slice(0, -1)} in our {label.replace("Spotlight", "Spotlight Email")}!
          </p>
          <p><b>{content?.title}</b></p>
          <p>Learn more by clicking the link in this email or visiting our platform.</p>
          <em>— The PicoCareer Team</em>
        </div>
      );
  }
}

export function EmailPreview({ selectedContentIds, contentList, contentType }: EmailPreviewProps) {
  return (
    <div>
      <label className="block font-medium mb-1">Email Preview</label>
      <div className="border bg-muted rounded px-3 py-4 text-sm">
        {selectedContentIds.length === 0
          ? "(Nothing selected)"
          : selectedContentIds.map(id => {
            const content = contentList.find(c => c.id === id);
            return (
              <div key={id} className="mb-4 border-b last:border-b-0 pb-2 last:pb-0">
                {getEmailTemplate(content, contentType)}
              </div>
            );
          })}
      </div>
    </div>
  );
}
