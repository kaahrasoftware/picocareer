import { Card, CardHeader } from "@/components/ui/card";
import { Profile } from "@/types/database/profiles";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

export function MentorCard({ mentor }: { mentor: Profile }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            avatarUrl={mentor.avatar_url}
            fallback={mentor.full_name?.[0] || 'M'}
            size="md"
            editable={false}
            userId={mentor.id}
          />
        </div>
      </CardHeader>
    </Card>
  );
}
