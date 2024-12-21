export const blogFormFields = [
  { name: "title", label: "Title", placeholder: "Blog Post Title" },
  { name: "summary", label: "Summary", type: "textarea" as const, placeholder: "Brief summary of the blog post" },
  { name: "content", label: "Content", type: "textarea" as const, placeholder: "Full blog post content" },
  { name: "cover_image_url", label: "Cover Image", type: "image" as const, description: "Upload a cover image for your blog post" },
  { name: "categories", label: "Categories", type: "array" as const, placeholder: "Technology, Career Advice" },
  { name: "subcategories", label: "Subcategories", type: "array" as const, placeholder: "Web Development, Job Search" },
  { name: "is_recent", label: "Mark as Recent", type: "checkbox" as const, description: "Feature this post in recent blogs section" }
];