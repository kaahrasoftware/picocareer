import { z } from "zod";
import { FormFieldProps } from "@/components/forms/FormField";
import { categories } from "./categories";
import { subcategories } from "@/components/blog/data/subcategories";
import { Database } from "@/integrations/supabase/types";

type Categories = Database["public"]["Enums"]["categories"];
type Subcategories = Database["public"]["Enums"]["subcategories"];

// Transform categories and subcategories into the required format
const categoryOptions = categories.map(category => ({
  id: category,
  title: category
}));

const subcategoryOptions = Object.values(subcategories)
  .flat()
  .map((subcategory: Subcategories) => ({
    id: subcategory,
    title: subcategory
  }));

export const blogFormFields: FormFieldProps[] = [
  {
    name: "title",
    label: "Title",
    type: "text",
    placeholder: "Enter the blog title",
    required: true
  },
  {
    name: "content",
    label: "Content",
    type: "textarea",
    placeholder: "Write your blog content here",
    required: true
  },
  {
    name: "categories",
    label: "Categories",
    type: "select",
    placeholder: "Select categories",
    options: categoryOptions,
    required: true
  },
  {
    name: "subcategories",
    label: "Subcategories",
    type: "select",
    placeholder: "Select subcategories",
    options: subcategoryOptions,
    required: true
  },
  {
    name: "featured_image",
    label: "Featured Image",
    type: "image",
    bucket: "blog-images",
    description: "Upload a featured image for the blog post",
    required: true
  },
  {
    name: "tags",
    label: "Tags",
    type: "array",
    placeholder: "Enter tags (comma-separated)",
    required: false
  }
];

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  subcategories: z.array(z.string()).min(1, "At least one subcategory is required"),
  featured_image: z.string().min(1, "Featured image is required"),
  tags: z.array(z.string()).optional()
});