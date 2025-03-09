
import { FormFieldProps } from "@/components/forms/FormField";
import { z } from "zod";
import { RichTextEditor } from "@/components/forms/RichTextEditor";

export const feedSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  resource_type: z.string().min(1, "Resource type is required"),
  document_type: z.string().optional(),
  file_url: z.string().optional(),
  external_url: z.string().optional(),
  content: z.string().optional(),
});

export const feedFormFields: FormFieldProps[] = [
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
    placeholder: "Write a brief description of your resource",
    description: "A short description to explain what this resource is about",
  },
  {
    name: "resource_type",
    label: "Resource Type",
    type: "select",
    options: [
      { value: "document", label: "Document" },
      { value: "image", label: "Image" },
      { value: "video", label: "Video" },
      { value: "audio", label: "Audio" },
      { value: "external_link", label: "External Link" },
      { value: "text", label: "Text Content" }
    ],
    description: "Select the type of resource you want to upload",
    required: true,
  },
  {
    name: "document_type",
    label: "Document Type",
    type: "select",
    options: [
      { value: "pdf", label: "PDF" },
      { value: "word", label: "Word Document" },
      { value: "powerpoint", label: "PowerPoint" },
      { value: "excel", label: "Excel" },
      { value: "other", label: "Other" }
    ],
    description: "Select the type of document",
    dependsOn: "resource_type",
    dependsOnValue: "document",
  },
  {
    name: "file_url",
    label: "File",
    type: "file",
    bucket: "mentor_resources",
    description: "Upload your file here",
    dependsOn: "resource_type",
    dependsOnValues: ["document", "image", "video", "audio"],
  },
  {
    name: "external_url",
    label: "External URL",
    type: "text",
    placeholder: "https://example.com",
    description: "Enter the URL to external resource",
    dependsOn: "resource_type",
    dependsOnValue: "external_link",
  },
  {
    name: "content",
    label: "Content",
    type: "richtext",
    component: RichTextEditor,
    description: "Enter your content here",
    dependsOn: "resource_type",
    dependsOnValue: "text",
  },
];
