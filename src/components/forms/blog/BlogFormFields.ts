import { Database } from "@/integrations/supabase/types";

type Categories = Database["public"]["Enums"]["categories"];
type Subcategories = Database["public"]["Enums"]["subcategories"];

export const categories: Categories[] = [
  "Technology",
  "Career",
  "Education",
  "Digital Tools",
  "Extracurricular Activities",
  "Success Stories",
  "Volunteerism",
  "Community Service",
  "Entrepreneurship",
  "Financial Literacy",
  "Arts Careers",
  "STEM Education",
  "STEM Careers",
  "Humanities Careers",
  "Diversity and Inclusion",
  "Educational Resources",
  "Leadership Development",
  "Mental Health",
  "Wellbeing",
  "High School to University Transition",
  "Study Abroad Preparation",
  "Personal Branding",
  "Internship and Job Search",
  "Networking Strategies",
  "Skill Development",
  "University Admissions",
  "Career Guidance"
];

export const subcategories: Record<string, Subcategories[]> = {
  Technology: [
    "Essential Tech Skills for the Workplace",
    "Leveraging AI in Career Planning",
    "Artificial Intelligence",
    "Machine Learning",
    "Best Apps for Productivity",
    "Using Technology for Collaboration"
  ],
  Career: [
    "Industry-Specific Career Insights",
    "Choosing the Right Career Path",
    "Transitioning Between Careers",
    "Work-Life Balance Tips",
    "Career Advancement Strategies"
  ],
  Education: [
    "Study Tips",
    "College Life",
    "Graduate School",
    "Crafting a Winning Personal Statement",
    "Navigating the Application Process",
    "Preparing for Entrance Exams",
    "Choosing the Right University",
    "Scholarship and Financial Aid Advice"
  ]
};

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
    name: "is_recent", 
    label: "Mark as Recent", 
    type: "checkbox" as const, 
    description: "Feature this post in recent blogs section" 
  }
];