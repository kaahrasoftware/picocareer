
import { FormFieldProps } from "@/components/forms/FormField";
import { z } from "zod";
import { RichTextEditor } from "@/components/forms/RichTextEditor";

// Define the allowed resource types
export const RESOURCE_TYPES = [
  { value: 'text', label: 'Text Post' },
  { value: 'document', label: 'Document' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'link', label: 'External Link' }
];

// Define the allowed document types
export const DOCUMENT_TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'word', label: 'Word Document' },
  { value: 'powerpoint', label: 'PowerPoint' },
  { value: 'excel', label: 'Excel' },
  { value: 'other', label: 'Other' }
];

// Base schema for all resource types
export const feedBaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  resource_type: z.string().min(1, "Resource type is required"),
  categories: z.string().optional(),
  tags: z.string().optional(),
});

// Extended schema based on resource type
export const feedSchema = feedBaseSchema.and(
  z.discriminatedUnion("resource_type", [
    z.object({
      resource_type: z.literal("text"),
      content: z.string().min(10, "Content should be at least 10 characters"),
    }),
    z.object({
      resource_type: z.literal("document"),
      document_type: z.string().min(1, "Document type is required"),
      file_url: z.string().min(1, "Document file is required"),
    }),
    z.object({
      resource_type: z.literal("image"),
      file_url: z.string().min(1, "Image file is required"),
    }),
    z.object({
      resource_type: z.literal("video"),
      file_url: z.string().min(1, "Video file is required"),
    }),
    z.object({
      resource_type: z.literal("audio"),
      file_url: z.string().min(1, "Audio file is required"),
    }),
    z.object({
      resource_type: z.literal("link"),
      external_url: z.string().url("Invalid URL format"),
    }),
  ])
);

// Base fields for all resource types
const baseFields: FormFieldProps[] = [
  {
    name: "title",
    label: "Title",
    type: "text",
    placeholder: "Enter a title for your resource",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Write a brief description",
    required: true,
  },
  {
    name: "resource_type",
    label: "Resource Type",
    type: "select",
    options: RESOURCE_TYPES,
    required: true,
  },
  {
    name: "categories",
    label: "Categories",
    type: "category",
    description: "Select categories to help organize your resource",
  },
];

// Text post specific fields
const textFields: FormFieldProps[] = [
  {
    name: "content",
    label: "Content",
    type: "richtext",
    component: RichTextEditor,
    description: "Create your text content",
    required: true,
  },
];

// Document specific fields
const documentFields: FormFieldProps[] = [
  {
    name: "document_type",
    label: "Document Type",
    type: "select",
    options: DOCUMENT_TYPES,
    dependsOn: "resource_type",
    required: true,
  },
  {
    name: "file_url",
    label: "Upload Document",
    type: "image",
    bucket: "mentor_resources",
    accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
    description: "Upload your document (PDF, Word, PowerPoint, Excel)",
    required: true,
  },
];

// Image specific fields
const imageFields: FormFieldProps[] = [
  {
    name: "file_url",
    label: "Upload Image",
    type: "image",
    bucket: "mentor_resources",
    accept: "image/*",
    description: "Upload an image",
    required: true,
  },
];

// Video specific fields
const videoFields: FormFieldProps[] = [
  {
    name: "file_url",
    label: "Upload Video",
    type: "image",
    bucket: "mentor_resources",
    accept: "video/*",
    description: "Upload a video file",
    required: true,
  },
];

// Audio specific fields
const audioFields: FormFieldProps[] = [
  {
    name: "file_url",
    label: "Upload Audio",
    type: "image",
    bucket: "mentor_resources",
    accept: "audio/*",
    description: "Upload an audio file",
    required: true,
  },
];

// Link specific fields
const linkFields: FormFieldProps[] = [
  {
    name: "external_url",
    label: "External URL",
    type: "text",
    placeholder: "https://example.com",
    description: "Enter the URL of the external resource",
    required: true,
  },
];

// Export conditional field collections based on resource type
export const getFeedFormFields = (resourceType: string): FormFieldProps[] => {
  const specificFields = {
    text: textFields,
    document: documentFields,
    image: imageFields,
    video: videoFields,
    audio: audioFields,
    link: linkFields,
  }[resourceType as keyof typeof specificFields] || [];

  return [...baseFields, ...specificFields];
};
