
import { FormFieldProps } from "@/components/forms/FormField";
import { RichTextEditor } from "@/components/forms/RichTextEditor";

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
