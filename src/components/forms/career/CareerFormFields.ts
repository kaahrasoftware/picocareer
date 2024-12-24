export const careerFormFields = [
  { 
    name: "title", 
    label: "Career Title", 
    type: "text" as const,
    placeholder: "e.g., Software Engineer", 
    required: true 
  },
  { 
    name: "description", 
    label: "Description", 
    type: "textarea" as const, 
    placeholder: "Detailed description of the career path", 
    required: true 
  },
  { 
    name: "image_url", 
    label: "Career Image", 
    type: "image" as const, 
    bucket: "images",
    description: "Upload an image representing this career",
    required: false
  },
  { 
    name: "academic_majors", 
    label: "Related Academic Majors", 
    type: "array" as const, 
    placeholder: "Computer Science, Information Technology", 
    description: "Enter majors that are relevant to this career",
    required: false
  },
  { 
    name: "salary_range", 
    label: "Salary Range", 
    type: "text" as const,
    placeholder: "$50,000 - $100,000",
    required: false
  },
  { 
    name: "industry", 
    label: "Industry", 
    type: "text" as const,
    placeholder: "e.g., Technology, Healthcare, Finance",
    required: false
  },
  { 
    name: "required_education", 
    label: "Required Education", 
    type: "array" as const, 
    placeholder: "Bachelor's Degree, Master's Degree",
    required: false
  },
  { 
    name: "required_skills", 
    label: "Required Skills", 
    type: "array" as const, 
    placeholder: "Programming, Problem Solving",
    required: false
  },
  { 
    name: "required_tools", 
    label: "Required Tools", 
    type: "array" as const, 
    placeholder: "Git, VS Code",
    required: false
  },
  { 
    name: "work_environment", 
    label: "Work Environment", 
    type: "textarea" as const, 
    placeholder: "Description of typical work environment",
    required: false
  },
  { 
    name: "growth_potential", 
    label: "Growth Potential", 
    type: "textarea" as const, 
    placeholder: "Career advancement opportunities and potential growth paths",
    required: false
  },
  { 
    name: "job_outlook", 
    label: "Job Outlook", 
    type: "textarea" as const, 
    placeholder: "Future prospects and growth expectations",
    required: false
  },
  { 
    name: "stress_levels", 
    label: "Stress Level", 
    type: "text" as const, 
    placeholder: "Low, Medium, or High",
    required: false
  },
  { 
    name: "keywords", 
    label: "Keywords", 
    type: "array" as const, 
    placeholder: "tech, coding, development",
    required: false
  },
  { 
    name: "transferable_skills", 
    label: "Transferable Skills", 
    type: "array" as const, 
    placeholder: "Communication, Leadership",
    required: false
  },
  { 
    name: "careers_to_consider_switching_to", 
    label: "Related Careers", 
    type: "array" as const, 
    placeholder: "Data Scientist, DevOps Engineer",
    required: false
  },
  { 
    name: "featured", 
    label: "Featured Career", 
    type: "checkbox" as const, 
    description: "Show this career in featured sections",
    required: false
  },
  {
    name: "rare",
    label: "Rare Career",
    type: "checkbox" as const,
    description: "Mark this as a rare or uncommon career path",
    required: false
  },
  {
    name: "popular",
    label: "Popular Career",
    type: "checkbox" as const,
    description: "Mark this as a popular career choice",
    required: false
  },
  {
    name: "new_career",
    label: "New Career",
    type: "checkbox" as const,
    description: "Mark this as a newly emerging career path",
    required: false
  }
] as const;