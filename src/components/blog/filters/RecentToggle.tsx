import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface RecentToggleProps {
  showRecentOnly: boolean;
  setShowRecentOnly: (value: boolean) => void;
}

export function RecentToggle({ showRecentOnly, setShowRecentOnly }: RecentToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="recent-posts"
        checked={showRecentOnly}
        onCheckedChange={setShowRecentOnly}
      />
      <Label htmlFor="recent-posts">Recent posts only</Label>
    </div>
  );
}