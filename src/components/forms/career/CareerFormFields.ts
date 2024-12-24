import { FormFieldProps } from "../FormField";

export const careerFormFields: FormFieldProps[] = [
  {
    name: "title",
    label: "Career Title",
    type: "text",
    placeholder: "e.g., Software Engineer",
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
    name: "featured",
    label: "Featured",
    type: "checkbox",
    description: "Check if this career should be featured"
  },
  {
    name: "learning_objectives",
    label: "Learning Objectives",
    type: "textarea",
    placeholder: "List the learning objectives for this career",
  },
  {
    name: "common_courses",
    label: "Common Courses",
    type: "textarea",
    placeholder: "List common courses for this career",
  },
  {
    name: "interdisciplinary_connections",
    label: "Interdisciplinary Connections",
    type: "textarea",
    placeholder: "List any interdisciplinary connections",
  },
  {
    name: "job_prospects",
    label: "Job Prospects",
    type: "textarea",
    placeholder: "Describe job prospects for this career",
  },
  {
    name: "certifications_to_consider",
    label: "Certifications to Consider",
    type: "textarea",
    placeholder: "List certifications relevant to this career",
  },
  {
    name: "degree_levels",
    label: "Degree Levels",
    type: "textarea",
    placeholder: "List degree levels required for this career",
  },
  {
    name: "affiliated_programs",
    label: "Affiliated Programs",
    type: "textarea",
    placeholder: "List programs affiliated with this career",
  },
  {
    name: "gpa_expectations",
    label: "GPA Expectations",
    type: "text",
    placeholder: "Enter expected GPA for this career",
  },
  {
    name: "transferable_skills",
    label: "Transferable Skills",
    type: "textarea",
    placeholder: "List transferable skills for this career",
  },
  {
    name: "tools_knowledge",
    label: "Tools Knowledge",
    type: "textarea",
    placeholder: "List tools knowledge required for this career",
  },
  {
    name: "potential_salary",
    label: "Potential Salary",
    type: "text",
    placeholder: "Enter potential salary for this career",
  },
  {
    name: "passion_for_subject",
    label: "Passion for Subject",
    type: "textarea",
    placeholder: "Describe passion for the subject",
  },
  {
    name: "skill_match",
    label: "Skill Match",
    type: "textarea",
    placeholder: "List skills that match this career",
  },
  {
    name: "professional_associations",
    label: "Professional Associations",
    type: "textarea",
    placeholder: "List professional associations related to this career",
  },
  {
    name: "global_applicability",
    label: "Global Applicability",
    type: "textarea",
    placeholder: "Describe global applicability of this career",
  },
  {
    name: "common_difficulties",
    label: "Common Difficulties",
    type: "textarea",
    placeholder: "List common difficulties in this career",
  },
  {
    name: "majors_to_consider_switching_to",
    label: "Majors to Consider Switching To",
    type: "textarea",
    placeholder: "List majors to consider switching to",
  },
  {
    name: "career_opportunities",
    label: "Career Opportunities",
    type: "textarea",
    placeholder: "List career opportunities available",
  },
  {
    name: "intensity",
    label: "Intensity",
    type: "text",
    placeholder: "Describe the intensity of this career",
  },
  {
    name: "stress_level",
    label: "Stress Level",
    type: "text",
    placeholder: "Describe the stress level of this career",
  },
  {
    name: "dropout_rates",
    label: "Dropout Rates",
    type: "text",
    placeholder: "Enter dropout rates for this career",
  }
];
