export const majorFormFields = [
  { 
    name: "title", 
    label: "Major Title", 
    placeholder: "e.g., Computer Science, Psychology, Business Administration", 
    description: "Enter the official name of the academic major",
    required: true 
  },
  { 
    name: "description", 
    label: "Description", 
    type: "textarea" as const, 
    placeholder: "Provide a comprehensive overview of the major...", 
    description: "Detailed description of what the major entails, its focus areas, and objectives",
    required: true 
  },
  { 
    name: "featured", 
    label: "Featured Major", 
    type: "checkbox" as const, 
    description: "Check this box if this major should be highlighted in featured sections" 
  },
  { 
    name: "learning_objectives", 
    label: "Learning Objectives", 
    type: "array" as const, 
    placeholder: "e.g., Critical thinking, Problem solving", 
    description: "Enter key learning outcomes" 
  },
  { 
    name: "common_courses", 
    label: "Common Courses", 
    type: "array" as const, 
    placeholder: "e.g., Introduction to Programming, Data Structures", 
    description: "List typical courses in this major" 
  },
  { 
    name: "interdisciplinary_connections", 
    label: "Interdisciplinary Connections", 
    type: "array" as const, 
    placeholder: "e.g., Mathematics, Physics", 
    description: "List related academic fields" 
  },
  { 
    name: "job_prospects", 
    label: "Job Prospects", 
    type: "textarea" as const, 
    placeholder: "Describe potential career paths and job market outlook...", 
    description: "Detailed overview of career opportunities and industry demand" 
  },
  { 
    name: "certifications_to_consider", 
    label: "Recommended Certifications", 
    type: "array" as const, 
    placeholder: "e.g., AWS Certified Solutions Architect, PMP", 
    description: "List relevant professional certifications" 
  },
  { 
    name: "degree_levels", 
    label: "Available Degree Levels", 
    type: "array" as const, 
    placeholder: "e.g., Bachelor's, Master's, Ph.D.", 
    description: "List available degree levels" 
  },
  { 
    name: "affiliated_programs", 
    label: "Affiliated Programs", 
    type: "array" as const, 
    placeholder: "e.g., Research initiatives, Industry partnerships", 
    description: "List related programs or partnerships" 
  },
  { 
    name: "gpa_expectations", 
    label: "Expected GPA", 
    type: "number" as const, 
    placeholder: "3.0", 
    description: "Typical GPA requirement (e.g., 3.0 out of 4.0)" 
  },
  { 
    name: "transferable_skills", 
    label: "Transferable Skills", 
    type: "array" as const, 
    placeholder: "e.g., Communication, Leadership", 
    description: "List key transferable skills gained" 
  },
  { 
    name: "tools_knowledge", 
    label: "Technical Skills & Tools", 
    type: "array" as const, 
    placeholder: "e.g., Python, SPSS, AutoCAD", 
    description: "List specific tools or technologies used" 
  },
  { 
    name: "potential_salary", 
    label: "Salary Range", 
    placeholder: "e.g., $60,000 - $120,000", 
    description: "Expected salary range for entry to mid-level positions" 
  },
  { 
    name: "passion_for_subject", 
    label: "You are a Good fit if", 
    placeholder: "e.g., Strong interest in technology and problem-solving", 
    description: "Describe the interests that align well with this major" 
  },
  { 
    name: "skill_match", 
    label: "Required Skills", 
    type: "array" as const, 
    placeholder: "e.g., Mathematical aptitude, Analytical thinking", 
    description: "List essential skills needed to succeed" 
  },
  { 
    name: "professional_associations", 
    label: "Professional Organizations", 
    type: "array" as const, 
    placeholder: "e.g., IEEE, American Psychological Association", 
    description: "List relevant professional organizations" 
  },
  { 
    name: "global_applicability", 
    label: "Global Adaptability", 
    type: "textarea" as const, 
    placeholder: "Describe worldwide career opportunities and relevance...", 
    description: "Overview of how this major applies globally" 
  },
  { 
    name: "common_difficulties", 
    label: "Common Challenges", 
    type: "array" as const, 
    placeholder: "e.g., Complex mathematics, Heavy workload", 
    description: "List typical challenges students face" 
  },
  { 
    name: "career_opportunities", 
    label: "Career Opportunities", 
    type: "array" as const, 
    placeholder: "e.g., Software Engineer, Data Scientist", 
    description: "List specific job titles graduates can pursue" 
  },
  { 
    name: "intensity", 
    label: "Program Intensity", 
    placeholder: "High, Medium, or Low", 
    description: "Indicate the overall workload and difficulty level" 
  },
  { 
    name: "stress_level", 
    label: "Stress Level", 
    placeholder: "High, Medium, or Low", 
    description: "Typical stress level experienced by students" 
  },
  { 
    name: "dropout_rates", 
    label: "Retention Rate", 
    placeholder: "e.g., 85% (or 15% dropout rate)", 
    description: "Average percentage of students who complete the program" 
  },
  { 
    name: "majors_to_consider_switching_to", 
    label: "Alternative Majors", 
    type: "array" as const, 
    placeholder: "e.g., Information Technology, Data Science", 
    description: "List related majors students might consider" 
  }
];