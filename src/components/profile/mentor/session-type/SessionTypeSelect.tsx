import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SessionTypeEnum } from "@/types/session";
import { Database } from "@/integrations/supabase/types";

type SessionType = Database["public"]["Enums"]["session_type"];

const sessionTypeLabels: Record<SessionType, string> = {
  "Know About my Career": "Know About my Career",
  "Resume/CV Review": "Resume/CV Review",
  "Campus France": "Campus France",
  "Undergrad Application": "Undergrad Application",
  "Grad Application": "Grad Application",
  "TOEFL Exam Prep Advice": "TOEFL Exam Prep Advice",
  "IELTS Exam Prep Advice": "IELTS Exam Prep Advice",
  "Duolingo Exam Prep Advice": "Duolingo Exam Prep Advice",
  "SAT Exam Prep Advice": "SAT Exam Prep Advice",
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
  "Study Tips": "Study Tips",
  "Volunteer Opportunities": "Volunteer Opportunities",
  "Know About my Academic Major": "Know About my Academic Major"
};

interface SessionTypeSelectProps {
  value?: SessionTypeEnum;
  onValueChange: (value: SessionTypeEnum) => void;
}

export function SessionTypeSelect({ value, onValueChange }: SessionTypeSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select session type" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(sessionTypeLabels).map(([type, label]) => (
          <SelectItem key={type} value={type}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}