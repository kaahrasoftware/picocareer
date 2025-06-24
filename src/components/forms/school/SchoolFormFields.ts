
import { FormFieldProps } from "@/components/forms/FormField";
import { COUNTRIES, US_STATES } from "@/constants/geography";

export const schoolFormFields: FormFieldProps[] = [
  // Basic Information
  {
    name: "name",
    label: "School Name",
    type: "text",
    placeholder: "Enter school name",
    required: true
  },
  {
    name: "type",
    label: "School Type",
    type: "select",
    required: true,
    options: [
      { value: "High School", label: "High School" },
      { value: "College", label: "College" },
      { value: "University", label: "University" },
      { value: "Other", label: "Other" }
    ]
  },
  
  // Location Information
  {
    name: "country",
    label: "Country",
    type: "select",
    required: true,
    options: COUNTRIES.map(country => ({ value: country, label: country }))
  },
  {
    name: "state",
    label: "State/Province",
    type: "select",
    placeholder: "Select state/province",
    options: US_STATES.map(state => ({ value: state, label: state }))
  },
  {
    name: "city",
    label: "City",
    type: "text",
    placeholder: "Enter city name"
  },
  {
    name: "location",
    label: "Full Location",
    type: "text",
    placeholder: "City, State/Province, Country",
    description: "Complete location description"
  },

  // Contact Information
  {
    name: "website",
    label: "Website",
    type: "url",
    placeholder: "https://www.school.edu"
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "contact@school.edu"
  },
  {
    name: "phone",
    label: "Phone",
    type: "text",
    placeholder: "+1 (555) 123-4567"
  },

  // Academic Information
  {
    name: "established_year",
    label: "Established Year",
    type: "number",
    placeholder: "e.g., 1985"
  },
  {
    name: "student_population",
    label: "Student Population",
    type: "number",
    placeholder: "Total number of students"
  },
  {
    name: "acceptance_rate",
    label: "Acceptance Rate",
    type: "number",
    placeholder: "Enter as decimal (e.g., 0.65 for 65%)",
    description: "Enter acceptance rate as a decimal between 0 and 1"
  },
  {
    name: "student_faculty_ratio",
    label: "Student-Faculty Ratio",
    type: "text",
    placeholder: "e.g., 15:1"
  },

  // Tuition and Fees (as JSON structure)
  {
    name: "tuition_in_state",
    label: "In-State Tuition (Annual)",
    type: "number",
    placeholder: "Annual tuition for in-state students"
  },
  {
    name: "tuition_out_of_state",
    label: "Out-of-State Tuition (Annual)",
    type: "number",
    placeholder: "Annual tuition for out-of-state students"
  },
  {
    name: "tuition_international",
    label: "International Tuition (Annual)",
    type: "number",
    placeholder: "Annual tuition for international students"
  },
  {
    name: "room_and_board",
    label: "Room and Board",
    type: "number",
    placeholder: "Annual room and board costs"
  },
  {
    name: "application_fee",
    label: "Application Fee",
    type: "number",
    placeholder: "Application fee amount"
  },

  // Academic Requirements
  {
    name: "application_deadline",
    label: "Application Deadline",
    type: "text",
    placeholder: "e.g., March 1st"
  },
  {
    name: "sat_range_low",
    label: "SAT Range (Low)",
    type: "number",
    placeholder: "Minimum SAT score"
  },
  {
    name: "sat_range_high",
    label: "SAT Range (High)",
    type: "number",
    placeholder: "Maximum SAT score"
  },
  {
    name: "act_range_low",
    label: "ACT Range (Low)",
    type: "number",
    placeholder: "Minimum ACT score"
  },
  {
    name: "act_range_high",
    label: "ACT Range (High)",
    type: "number",
    placeholder: "Maximum ACT score"
  },
  {
    name: "gpa_average",
    label: "Average GPA",
    type: "number",
    placeholder: "Average GPA of admitted students"
  },

  // Media
  {
    name: "cover_image_url",
    label: "Cover Image",
    type: "image",
    bucket: "schools",
    accept: "image/*",
    folderPath: "cover-images"
  },
  {
    name: "logo_url",
    label: "School Logo",
    type: "image",
    bucket: "schools",
    accept: "image/*",
    folderPath: "logos"
  },

  // Links and Resources
  {
    name: "undergraduate_application_url",
    label: "Undergraduate Application URL",
    type: "url",
    placeholder: "https://apply.school.edu/undergraduate"
  },
  {
    name: "graduate_application_url",
    label: "Graduate Application URL",
    type: "url",
    placeholder: "https://apply.school.edu/graduate"
  },
  {
    name: "admissions_page_url",
    label: "Admissions Page URL",
    type: "url",
    placeholder: "https://www.school.edu/admissions"
  },
  {
    name: "international_students_url",
    label: "International Students URL",
    type: "url",
    placeholder: "https://www.school.edu/international"
  },
  {
    name: "financial_aid_url",
    label: "Financial Aid URL",
    type: "url",
    placeholder: "https://www.school.edu/financial-aid"
  },
  {
    name: "virtual_tour_url",
    label: "Virtual Tour URL",
    type: "url",
    placeholder: "https://tour.school.edu"
  },

  // Ranking and Features
  {
    name: "ranking",
    label: "Ranking",
    type: "text",
    placeholder: "e.g., #50 National Universities"
  },
  {
    name: "featured",
    label: "Featured School",
    type: "checkbox",
    description: "Mark this school as featured"
  },
  {
    name: "featured_priority",
    label: "Featured Priority",
    type: "number",
    placeholder: "Priority order for featured schools (1-100)"
  },

  // Academic Programs (as arrays)
  {
    name: "programs_offered",
    label: "Programs Offered",
    type: "array",
    placeholder: "List programs offered (comma-separated)",
    description: "Enter programs separated by commas"
  },
  {
    name: "notable_programs",
    label: "Notable Programs",
    type: "array",
    placeholder: "List notable academic programs (comma-separated)"
  },

  // Statistics
  {
    name: "graduation_rate",
    label: "Graduation Rate",
    type: "number",
    placeholder: "Graduation rate as decimal (e.g., 0.85 for 85%)"
  },
  {
    name: "employment_rate",
    label: "Employment Rate",
    type: "number",
    placeholder: "Employment rate as decimal (e.g., 0.92 for 92%)"
  },
  {
    name: "average_salary_after_graduation",
    label: "Average Salary After Graduation",
    type: "number",
    placeholder: "Average starting salary"
  }
];
