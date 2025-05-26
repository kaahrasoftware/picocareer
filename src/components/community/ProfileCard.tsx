
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { Badge } from '@/components/ui/badge';

interface ProfileCardProps {
  profile: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    skills?: string[];
    position?: string;
  };
  onClick?: () => void;
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <ProfileAvatar 
            avatarUrl={profile.avatar_url}
            size="md"
            editable={false}
          >
            {initials}
          </ProfileAvatar>
          <div>
            <h3 className="font-semibold">{profile.full_name || 'Anonymous'}</h3>
            {profile.position && (
              <p className="text-sm text-muted-foreground">{profile.position}</p>
            )}
          </div>
        </div>
        
        {profile.bio && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {profile.bio}
          </p>
        )}
        
        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{profile.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
