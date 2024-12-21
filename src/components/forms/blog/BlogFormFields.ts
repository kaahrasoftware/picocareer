export const blogFormFields = [
  { name: "title", label: "Title", placeholder: "Blog Post Title" },
  { name: "summary", label: "Summary", type: "textarea", placeholder: "Brief summary of the blog post" },
  { name: "content", label: "Content", type: "textarea", placeholder: "Full blog post content" },
  { name: "cover_image_url", label: "Cover Image URL", placeholder: "https://example.com/image.jpg" },
  { name: "categories", label: "Categories", type: "array", placeholder: "Technology, Career Advice" },
  { name: "subcategories", label: "Subcategories", type: "array", placeholder: "Web Development, Job Search" },
  { name: "is_recent", label: "Mark as Recent", type: "checkbox", description: "Feature this post in recent blogs section" }
];