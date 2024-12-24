import { categories } from "./categories";
import { subcategories } from "./subcategories";

export const blogFormFields = [
  { 
    name: "title", 
    label: "Title", 
    placeholder: "Blog Post Title", 
    required: true 
  },
  { 
    name: "summary", 
    label: "Summary", 
    type: "textarea" as const, 
    placeholder: "Brief summary of the blog post", 
    required: true 
  },
  { 
    name: "content", 
    label: "Content", 
    type: "textarea" as const, 
    placeholder: "Full blog post content", 
    required: true 
  },
  { 
    name: "cover_image_url", 
    label: "Cover Image", 
    type: "image" as const, 
    description: "Upload a cover image for your blog post",
    bucket: "images"
  },
  { 
    name: "categories", 
    label: "Categories", 
    type: "multiselect" as const,
    placeholder: "Select categories",
    options: categories
  },
  { 
    name: "subcategories", 
    label: "Subcategories", 
    type: "multiselect" as const,
    placeholder: "Select subcategories",
    options: [],
    dependsOn: "categories"
  },
  { 
    name: "other_notes", 
    label: "Additional Notes", 
    type: "textarea" as const, 
    placeholder: "Any additional notes or remarks about this blog post",
    description: "Optional notes that might be helpful for readers or future reference" 
  },
  { 
    name: "is_recent", 
    label: "Mark as Recent", 
    type: "checkbox" as const, 
    description: "Feature this post in recent blogs section" 
  }
];

export { categories, subcategories };