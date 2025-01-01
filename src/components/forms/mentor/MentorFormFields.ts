import { FormFieldProps } from "@/components/forms/FormField";
import { mentorRegistrationSchema } from "./validation/mentorSchema";
import { personalFields } from "./fields/personalFields";
import { professionalFields } from "./fields/professionalFields";
import { educationFields } from "./fields/educationFields";
import { skillsFields } from "./fields/skillsFields";
import { socialFields } from "./fields/socialFields";

export { mentorRegistrationSchema };
export const mentorFormFields: FormFieldProps[] = [
  ...personalFields,
  ...professionalFields,
  ...educationFields,
  ...skillsFields,
  ...socialFields
];