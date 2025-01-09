import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import type { SessionTypeFormData, SessionTypeEnum } from "@/types/session";

const SESSION_TYPE_OPTIONS: Record<SessionTypeEnum, string> = {
  "Know About my Career": "Know About my Career",
  "Resume/CV Review": "Resume/CV Review",
  "Campus France": "Campus France",
  "Undergrad Application": "Undergrad Application",
  "Grad Application": "Grad Application",
  "TOEFL Exam Prep Advice": "TOEFL Exam Prep Advice",
  "IELTS Exam Prep Advice": "IELTS Exam Prep Advice",
  "Duolingo Exam Prep Advice": "Duolingo Exam Prep Advice",
  "SAT Exam Prep Advise": "SAT Exam Prep Advise",
  "ACT Exam Prep Advice": "ACT Exam Prep Advice",
  "GRE Exam Prep Advice": "GRE Exam Prep Advice",
  "GMAT Exam Prep Advice": "GMAT Exam Prep Advice",
  "MCAT Exam Prep Advice": "MCAT Exam Prep Advice",
  "LSAT Exam Prep Advice": "LSAT Exam Prep Advice",
  "DAT Exam Prep Advice": "DAT Exam Prep Advice",
  "Advice for PhD Students": "Advice for PhD Students",
  "How to Find Grants/Fellowships": "How to Find Grants/Fellowships",
  "Grant Writing Guidance": "Grant Writing Guidance",
  "Interview Prep": "Interview Prep",
  "How to Succeed as a College Student": "How to Succeed as a College Student",
  "Investment Strategies": "Investment Strategies",
  "Study Abroad Programs": "Study Abroad Programs",
  "Tips for F-1 Students": "Tips for F-1 Students",
  "College Application Last Review": "College Application Last Review",
  "Application Essays Review": "Application Essays Review",
  "I need someone to practice my presentation with": "I need someone to practice my presentation with",
  "Know About my Academic Major": "Know About my Academic Major"
};

interface SessionTypeSelectProps {
  control: Control<SessionTypeFormData>;
}

export function SessionTypeSelect({ control }: SessionTypeSelectProps) {
  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Session Type</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select a session type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SESSION_TYPE_OPTIONS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}