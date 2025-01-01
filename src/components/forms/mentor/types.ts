import { z } from "zod";
import { mentorRegistrationSchema } from "./MentorFormFields";

export type FormValues = z.infer<typeof mentorRegistrationSchema>;