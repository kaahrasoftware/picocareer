import { Building2, GraduationCap } from "lucide-react";

interface MentorInfoProps {
  company: string;
  title: string;
  education?: string;
}

export function MentorInfo({ company, title, education }: MentorInfoProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-gray-400">
        <Building2 size={16} />
        <span>{company}</span>
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      {education && (
        <div className="flex items-center gap-2 text-gray-400">
          <GraduationCap size={16} />
          <span>{education}</span>
        </div>
      )}
    </div>
  );
}