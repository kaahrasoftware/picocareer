import { Users } from "lucide-react";

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
    return (count / 1000000).toFixed(1) + "M";
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </h3>
        {profilesCount !== undefined && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{formatProfileCount(profilesCount)}</span>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 text-left">
        {description}
      </p>
    </div>
  );
}