import { Card, CardHeader } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import type { Profile } from "@/types/database/profiles";

export function ProfileCard({ profile }: { profile: Profile }) {
  if (!profile) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            avatarUrl={profile.avatar_url}
            fallback={profile.full_name?.[0] || 'U'}
            size="md"
            editable={false}
            userId={profile.id}
          />
          <div>
            <h3 className="text-lg font-semibold">{profile.full_name}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}