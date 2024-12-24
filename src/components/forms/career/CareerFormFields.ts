export const careerFormFields = [
  { 
    name: "title", 
    label: "Career Title", 
    placeholder: "e.g., Software Engineer", 
    type: "text",
    required: true 
  },
  { 
    name: "description", 
    label: "Description", 
    type: "textarea", 
    placeholder: "Detailed description of the career path", 
    required: true 
  },
  { 
    name: "image_url", 
    label: "Career Image", 
    type: "image", 
    bucket: "images",
    description: "Upload an image representing this career" 
  },
  { 
    name: "salary_range", 
    label: "Salary Range", 
    type: "text",
    placeholder: "$50,000 - $100,000" 
  },
  { 
    name: "industry", 
    label: "Industry", 
    type: "text",
    placeholder: "e.g., Technology, Healthcare, Finance" 
  },
  { 
    name: "required_education", 
    label: "Required Education", 
    type: "array", 
    placeholder: "Bachelor's Degree, Master's Degree" 
  },
  { 
    name: "required_skills", 
    label: "Required Skills", 
    type: "array", 
    placeholder: "Programming, Problem Solving" 
  },
  { 
    name: "required_tools", 
    label: "Required Tools", 
    type: "array", 
    placeholder: "Git, VS Code" 
  },
  { 
    name: "work_environment", 
    label: "Work Environment", 
    type: "textarea", 
    placeholder: "Description of typical work environment" 
  },
  { 
    name: "growth_potential", 
    label: "Growth Potential", 
    type: "textarea", 
    placeholder: "Career advancement opportunities and potential growth paths" 
  },
  { 
    name: "job_outlook", 
    label: "Job Outlook", 
    type: "textarea", 
    placeholder: "Future prospects and growth expectations" 
  },
  { 
    name: "stress_levels", 
    label: "Stress Level (1-10)", 
    type: "number", 
    placeholder: "5" 
  },
  { 
    name: "keywords", 
    label: "Keywords", 
    type: "array", 
    placeholder: "tech, coding, development" 
  },
  { 
    name: "transferable_skills", 
    label: "Transferable Skills", 
    type: "array", 
    placeholder: "Communication, Leadership" 
  },
  { 
    name: "careers_to_consider_switching_to", 
    label: "Related Careers", 
    type: "array", 
    placeholder: "Data Scientist, DevOps Engineer" 
  },
  { 
    name: "featured", 
    label: "Featured Career", 
    type: "checkbox", 
    description: "Show this career in featured sections" 
  }
];