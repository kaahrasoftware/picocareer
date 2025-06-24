
import { FormFieldProps } from "@/components/forms/FormField";

export const companyFormFields: FormFieldProps[] = [
  {
    name: "name",
    label: "Company Name",
    type: "text",
    placeholder: "Enter company name",
    required: true
  },
  {
    name: "industry",
    label: "Industry",
    type: "text",
    placeholder: "e.g., Technology, Healthcare, Finance",
    description: "Primary industry or sector the company operates in"
  },
  {
    name: "website",
    label: "Website",
    type: "url",
    placeholder: "https://www.company.com",
    description: "Company's official website URL"
  }
];
