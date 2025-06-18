
import { FormFieldProps } from "@/components/forms/FormField";

export const schoolFormFields: FormFieldProps[] = [
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
      { value: "University", label: "University" },
      { value: "College", label: "College" },
      { value: "Community College", label: "Community College" },
      { value: "Technical School", label: "Technical School" },
      { value: "Trade School", label: "Trade School" },
      { value: "Graduate School", label: "Graduate School" },
      { value: "Online Institution", label: "Online Institution" },
      { value: "Other", label: "Other" }
    ]
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    placeholder: "City, State/Province, Country"
  },
  {
    name: "website",
    label: "Website",
    type: "url",
    placeholder: "https://www.school.edu"
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Brief description of the school",
    description: "Provide information about the school's mission, programs, and unique features"
  },
  {
    name: "tuition_in_state",
    label: "In-State Tuition (Annual)",
    type: "text",
    placeholder: "$XX,XXX"
  },
  {
    name: "tuition_out_of_state",
    label: "Out-of-State Tuition (Annual)",
    type: "text",
    placeholder: "$XX,XXX"
  },
  {
    name: "student_population",
    label: "Student Population",
    type: "number",
    placeholder: "Total number of students"
  },
  {
    name: "acceptance_rate",
    label: "Acceptance Rate (%)",
    type: "number",
    placeholder: "Percentage (0-100)"
  },
  {
    name: "notable_programs",
    label: "Notable Programs",
    type: "array",
    placeholder: "List notable academic programs (comma-separated)"
  },
  {
    name: "campus_size",
    label: "Campus Size",
    type: "text",
    placeholder: "e.g., 500 acres, Urban campus"
  },
  {
    name: "athletics_division",
    label: "Athletics Division",
    type: "select",
    options: [
      { value: "", label: "Not Applicable" },
      { value: "Division I", label: "Division I" },
      { value: "Division II", label: "Division II" },
      { value: "Division III", label: "Division III" },
      { value: "NAIA", label: "NAIA" },
      { value: "NJCAA", label: "NJCAA" }
    ]
  }
];
