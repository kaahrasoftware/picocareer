import { Card, CardContent } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

interface ProfileCardProps {
  profile: {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
    career_title: string | null;
  };
  onClick: (profileId: string) => void;
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  return (
    <Card
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => onClick(profile.id)}
    >
      <CardContent className="p-4">
        <div className="mt-2">
          <div className="flex items-center space-x-3">
            <ProfileAvatar 
              avatarUrl={profile.avatar_url || ""} 
              imageAlt={profile.full_name || "User"}
              size="md"
              editable={false}
            />
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                {profile.full_name}
              </h3>
              <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                {profile.career_title || "Career Professional"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
