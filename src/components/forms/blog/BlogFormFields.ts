
import { FormFieldProps } from "@/components/forms/FormField";
import { RichTextEditor } from "@/components/forms/RichTextEditor";

export const blogFormFields: FormFieldProps[] = [
  {
    name: "title",
    label: "Title",
    type: "text",
    placeholder: "Enter your blog title",
    required: true
  },
  {
    name: "summary",
    label: "Summary",
    type: "textarea",
    placeholder: "Provide a brief summary of your blog post",
    required: true
  },
  {
    name: "content",
    label: "Content",
    type: "richtext",
    placeholder: "Write your blog content here...",
    required: true,
    component: RichTextEditor,
    bucket: "blog-images"
  },
  {
    name: "cover_image_url",
    label: "Cover Image",
    type: "image",
    bucket: "blog-images",
    accept: "image/*"
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
    name: "is_recent",
    label: "Mark as Recent",
    type: "checkbox",
    description: "Check this if this is a recent/featured blog post"
  },
  {
    name: "other_notes",
    label: "Additional Notes",
    type: "textarea",
    placeholder: "Any additional notes or information"
  }
];
