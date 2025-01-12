import { SessionTypeEnum } from "@/types/calendar";

interface SessionTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const sessionTypeLabels: Record<SessionTypeEnum, string> = {
  "Career Guidance": "Career Guidance",
  "Mock Interview": "Mock Interview",
  "Resume Review": "Resume Review",
  "Portfolio Review": "Portfolio Review",
  "General Mentorship": "General Mentorship",
  "Technical Discussion": "Technical Discussion",
  "Project Feedback": "Project Feedback",
  "Study Planning": "Study Planning",
  "Exam Preparation": "Exam Preparation",
  "Industry Insights": "Industry Insights"
};

export function SessionTypeSelect({ value, onChange }: SessionTypeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded-md bg-background"
    >
      <option value="">Select a session type</option>
      {Object.entries(sessionTypeLabels).map(([type, label]) => (
        <option key={type} value={type}>
          {label}
        </option>
      ))}
    </select>
  );
}