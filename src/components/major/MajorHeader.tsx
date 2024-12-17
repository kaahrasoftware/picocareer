import { Users, GraduationCap } from "lucide-react";

interface MajorHeaderProps {
  title: string;
  description: string;
  profilesCount?: number;
}

export function MajorHeader({ title, description, profilesCount }: MajorHeaderProps) {
  const formatProfileCount = (count: number | undefined) => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + "K";
    if (count < 1000000000) return (count / 1000000).toFixed(1) + "M";
    return (count / 1000000000).toFixed(1) + "T";
  };

  return (
    <div className="flex items-start gap-4 mb-4">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <GraduationCap className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{formatProfileCount(profilesCount)}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>
    </div>
  );
}