
import { FormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourceType, DocumentType } from "@/types/database/hubs";

export const RESOURCE_TYPES = [
  { value: 'document', label: 'Document' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'external_link', label: 'External Link' }
];

export const DOCUMENT_TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'word', label: 'Word Document' },
  { value: 'powerpoint', label: 'PowerPoint' },
  { value: 'excel', label: 'Excel' },
  { value: 'other', label: 'Other' }
];

interface ResourceTypeSelectProps {
  control: any;
  resourceType: ResourceType;
  documentType?: DocumentType;
}

export function ResourceTypeSelect({ 
  control, 
  resourceType,
  documentType 
}: ResourceTypeSelectProps) {
  return (
    <>
      <FormField
        control={control}
        name="resource_type"
        render={({ field }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">Resource Type</label>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />

      {resourceType === 'document' && (
        <FormField
          control={control}
          name="document_type"
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      )}
    </>
  );
}
