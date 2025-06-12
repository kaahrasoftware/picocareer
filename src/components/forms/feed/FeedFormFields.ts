
import { FormFieldProps } from "@/components/forms/FormField";
import { RichTextEditor } from "@/components/forms/RichTextEditor";

export const RESOURCE_TYPES = [
  { value: "text", label: "Text Content" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "document", label: "Document" },
  { value: "link", label: "External Link" }
];

export const feedFormFields: FormFieldProps[] = [
  {
    name: "title",
    label: "Title",
    type: "text",
    placeholder: "Enter content title",
    required: true
  },
  {
    name: "content",
    label: "Content",
    type: "richtext",
    placeholder: "Write your content here...",
    required: true,
    component: RichTextEditor,
    bucket: "feed-images"
  },
  {
    name: "summary",
    label: "Summary",
    type: "textarea",
    placeholder: "Provide a brief summary",
    required: true
  },
  {
    name: "categories",
    label: "Categories",
    type: "category",
    required: true
  },
  {
    name: "subcategories",
    label: "Subcategories", 
    type: "subcategory",
    required: true
  },
  {
    name: "cover_image_url",
    label: "Cover Image",
    type: "image",
    bucket: "feed-images",
    accept: "image/*"
  },
  {
    name: "is_recent",
    label: "Mark as Recent",
    type: "checkbox",
    description: "Check this if this is a recent/featured content"
  },
  {
    name: "other_notes",
    label: "Additional Notes",
    type: "textarea",
    placeholder: "Any additional notes or information"
  }
];

export const getFeedFormFields = (resourceType: string): FormFieldProps[] => {
  const baseFields = [...feedFormFields];
  
  // Add resource-type specific fields
  switch (resourceType) {
    case "video":
      baseFields.push({
        name: "video_url",
        label: "Video URL",
        type: "url",
        placeholder: "Enter video URL or upload video file",
        bucket: "feed-videos"
      });
      break;
    case "audio":
      baseFields.push({
        name: "audio_url",
        label: "Audio URL",
        type: "url",
        placeholder: "Enter audio URL or upload audio file",
        bucket: "feed-audio"
      });
      break;
    case "document":
      baseFields.push({
        name: "file_url",
        label: "Document",
        type: "file",
        placeholder: "Upload document file",
        bucket: "feed-documents"
      });
      break;
    case "link":
      baseFields.push({
        name: "external_url",
        label: "External URL",
        type: "url",
        placeholder: "Enter external link URL",
        required: true
      });
      break;
    case "image":
      // Image fields are already included in base fields
      break;
    default:
      // Text content - no additional fields needed
      break;
  }

  // Add hashtags field for all types
  baseFields.push({
    name: "hashtags",
    label: "Hashtags",
    type: "text",
    placeholder: "Enter hashtags separated by commas (e.g., #education, #career)"
  });

  return baseFields;
};
