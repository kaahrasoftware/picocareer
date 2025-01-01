import { FormFieldProps } from "@/components/forms/FormField";

export const personalFields: FormFieldProps[] = [
  {
    name: "first_name",
    label: "First Name",
    type: "text",
    placeholder: "Enter your first name",
    required: true
  },
  {
    name: "last_name",
    label: "Last Name",
    type: "text",
    placeholder: "Enter your last name",
    required: true
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    placeholder: "Enter your email address",
    required: true
  },
  {
    name: "avatar_url",
    label: "Profile Picture",
    type: "image",
    bucket: "avatars",
    description: "Upload a professional profile picture",
    required: true
  }
];