
import { Degree } from "@/types/database/enums";

// Convert the database enum to an array for use in form components
export const degreeOptions = Object.values(Degree) as const;

export type DegreeOption = typeof degreeOptions[number];
