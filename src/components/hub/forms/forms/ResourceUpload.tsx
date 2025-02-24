
import { BasicInputField } from "@/components/forms/fields/BasicInputField";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { ResourceType, DocumentType } from "@/types/database/hubs";

interface ResourceUploadProps {
  resourceType: ResourceType;
  documentType?: DocumentType;
  register: any;
  control: any;
  hubId: string;
}

export function getAcceptedFileTypes(resourceType: ResourceType, documentType?: DocumentType) {
  switch (resourceType) {
    case 'document':
      switch (documentType) {
        case 'pdf':
          return '.pdf';
        case 'word':
          return '.doc,.docx';
        case 'powerpoint':
          return '.ppt,.pptx';
        case 'excel':
          return '.xls,.xlsx';
        default:
          return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
      }
    case 'image':
      return 'image/*';
    case 'video':
      return 'video/*';
    case 'audio':
      return 'audio/*';
    default:
      return undefined;
  }
}

export function getUploadLabel(resourceType: ResourceType) {
  const type = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
  return `${type} File`;
}

export function ResourceUpload({
  resourceType,
  documentType,
  register,
  control,
  hubId
}: ResourceUploadProps) {
  if (resourceType === 'external_link') {
    return (
      <BasicInputField
        field={register("external_url")}
        label="External URL"
        placeholder="Enter external URL"
        required
      />
    );
  }

  return (
    <div className="space-y-2">
      <ImageUpload
        control={control}
        name="file_url"
        label={getUploadLabel(resourceType)}
        bucket={hubId}
        accept={getAcceptedFileTypes(resourceType, documentType)}
        hubId={hubId}
      />
    </div>
  );
}
