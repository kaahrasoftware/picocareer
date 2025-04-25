
import React from "react";
import { CONTENT_TYPE_LABELS, ContentType } from "./utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContentTypeSelectorProps {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
}

export function ContentTypeSelector({ contentType, setContentType }: ContentTypeSelectorProps) {
  return (
    <div>
      <Label htmlFor="contentType" className="block text-sm font-medium">Content Type</Label>
      <Select
        value={contentType}
        onValueChange={(value) => setContentType(value as ContentType)}
      >
        <SelectTrigger className="w-full mt-1">
          <SelectValue placeholder="Select content type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.keys(CONTENT_TYPE_LABELS).map((type) => (
              <SelectItem key={type} value={type}>
                {CONTENT_TYPE_LABELS[type as ContentType]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
