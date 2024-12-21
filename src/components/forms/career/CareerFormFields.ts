export const careerFormFields = [
  { name: "title", label: "Title", placeholder: "Software Engineer" },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "Detailed description of the career" },
  { name: "salary_range", label: "Salary Range", placeholder: "$50,000 - $100,000" },
  { name: "image_url", label: "Image URL", placeholder: "https://example.com/image.jpg" },
  { name: "featured", label: "Featured Career", type: "checkbox" as const, description: "Show this career in featured sections" },
  { name: "required_education", label: "Required Education", type: "array" as const, placeholder: "Bachelor's Degree, Master's Degree" },
  { name: "required_skills", label: "Required Skills", type: "array" as const, placeholder: "Programming, Problem Solving" },
  { name: "required_tools", label: "Required Tools", type: "array" as const, placeholder: "Git, VS Code" },
  { name: "job_outlook", label: "Job Outlook", type: "textarea" as const, placeholder: "Future prospects and growth expectations" },
  { name: "industry", label: "Industry", placeholder: "Technology, Healthcare, etc." },
  { name: "work_environment", label: "Work Environment", type: "textarea" as const, placeholder: "Description of typical work environment" },
  { name: "growth_potential", label: "Growth Potential", type: "textarea" as const, placeholder: "Career advancement opportunities" },
  { name: "keywords", label: "Keywords", type: "array" as const, placeholder: "tech, coding, development" },
  { name: "transferable_skills", label: "Transferable Skills", type: "array" as const, placeholder: "Communication, Leadership" },
  { name: "stress_levels", label: "Stress Levels (1-10)", type: "number" as const, placeholder: "5" },
  { name: "careers_to_consider_switching_to", label: "Related Careers", type: "array" as const, placeholder: "Data Scientist, DevOps Engineer" }
];