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
    description: "Upload an image representing this career" 
  },
  { 
    name: "academic_majors", 
    label: "Related Academic Majors", 
    type: "array" as const, 
    placeholder: "Computer Science, Information Technology", 
    description: "Enter majors that are relevant to this career"
  },
  { 
    name: "salary_range", 
    label: "Salary Range", 
    type: "text" as const,
    placeholder: "$50,000 - $100,000" 
  },
  { 
    name: "industry", 
    label: "Industry", 
    type: "text" as const,
    placeholder: "e.g., Technology, Healthcare, Finance" 
  },
  { 
    name: "required_education", 
    label: "Required Education", 
    type: "array" as const, 
    placeholder: "Bachelor's Degree, Master's Degree" 
  },
  { 
    name: "required_skills", 
    label: "Required Skills", 
    type: "array" as const, 
    placeholder: "Programming, Problem Solving" 
  },
  { 
    name: "required_tools", 
    label: "Required Tools", 
    type: "array" as const, 
    placeholder: "Git, VS Code" 
  },
  { 
    name: "work_environment", 
    label: "Work Environment", 
    type: "textarea" as const, 
    placeholder: "Description of typical work environment" 
  },
  { 
    name: "growth_potential", 
    label: "Growth Potential", 
    type: "textarea" as const, 
    placeholder: "Career advancement opportunities and potential growth paths" 
  },
  { 
    name: "job_outlook", 
    label: "Job Outlook", 
    type: "textarea" as const, 
    placeholder: "Future prospects and growth expectations" 
  },
  { 
    name: "stress_levels", 
    label: "Stress Level", 
    type: "text" as const, 
    placeholder: "Low, Medium, or High" 
  },
  { 
    name: "keywords", 
    label: "Keywords", 
    type: "array" as const, 
    placeholder: "tech, coding, development" 
  },
  { 
    name: "transferable_skills", 
    label: "Transferable Skills", 
    type: "array" as const, 
    placeholder: "Communication, Leadership" 
  },
  { 
    name: "careers_to_consider_switching_to", 
    label: "Related Careers", 
    type: "array" as const, 
    placeholder: "Data Scientist, DevOps Engineer" 
  },
  { 
    name: "featured", 
    label: "Featured Career", 
    type: "checkbox" as const, 
    description: "Show this career in featured sections" 
  }
];