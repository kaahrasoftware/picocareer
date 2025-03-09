
import { FormFieldProps } from "@/components/forms/FormField";
import { z } from "zod";
import { RichTextEditor } from "@/components/forms/RichTextEditor";

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(50, "Content should be at least 50 characters long"),
  cover_image_url: z.string().min(1, "Cover image is required"),
  categories: z.string().min(1, "At least one category is required"),
  subcategories: z.string().optional(),
  other_notes: z.string().optional(),
});

export const blogFormFields: FormFieldProps[] = [
  {
    name: "title",
    label: "Blog Title",
    type: "text",
    placeholder: "Enter a compelling title for your blog post",
    required: true,
  },
  {
    name: "summary",
    label: "Summary",
    type: "textarea",
    placeholder: "Write a brief summary of your blog post",
    description: "A short description that will appear in blog previews",
    required: true,
  },
  {
    name: "cover_image_url",
    label: "Cover Image",
    type: "image",
    bucket: "blog-images",
    description: "Upload a high-quality image for your blog post",
    required: true,
  },
  {
    name: "content",
    label: "Content",
    type: "richtext",
    component: RichTextEditor,
    description: "Use the rich text editor to format your content",
    required: true,
  },
  {
    name: "categories",
    label: "Categories",
    type: "category",
    description: "Select the main category for your blog post",
    required: true,
  },
  {
    name: "subcategories",
    label: "Subcategories",
    type: "subcategory",
    description: "Select relevant subcategories",
    dependsOn: "categories",
  },
  {
    name: "other_notes",
    label: "Additional Notes",
    type: "textarea",
    placeholder: "Any additional notes or remarks",
    description: "Optional notes about your blog post",
  },
];
