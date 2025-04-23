
import React from "react";
import { CONTENT_TYPE_LABELS, ContentType } from "./utils";

interface ContentTypeSelectorProps {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
}

export function ContentTypeSelector({ contentType, setContentType }: ContentTypeSelectorProps) {
  return (
    <div>
      <label htmlFor="contentType" className="block font-medium mb-1">Content Type</label>
      <select
        id="contentType"
        value={contentType}
        onChange={e => { 
          setContentType(e.target.value as ContentType);
        }}
        className="w-full border px-3 py-2 rounded"
      >
        {Object.keys(CONTENT_TYPE_LABELS).map(type => (
          <option key={type} value={type}>{CONTENT_TYPE_LABELS[type as ContentType]}</option>
        ))}
      </select>
    </div>
  );
}
