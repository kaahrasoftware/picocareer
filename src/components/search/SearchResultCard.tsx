
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, GraduationCap, Briefcase } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile-details/ProfileAvatar';

interface SearchResultCardProps {
  result: {
    id: string;
    type: string;
    title: string;
    description: string;
    location?: string;
    category?: string;
    status?: string;
    metadata?: any;
  };
  onClick?: () => void;
}

export const SearchResultCard = ({ result, onClick }: SearchResultCardProps) => {
  const getIcon = () => {
    switch (result.type) {
      case 'school':
        return <Building className="h-5 w-5" />;
      case 'major':
        return <GraduationCap className="h-5 w-5" />;
      case 'career':
        return <Briefcase className="h-5 w-5" />;
      case 'mentor':
        return <ProfileAvatar avatarUrl={result.metadata?.avatar_url} size="sm" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{result.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {result.type}
              </Badge>
              {result.category && (
                <Badge variant="outline" className="text-xs">
                  {result.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
          {result.description}
        </p>
        
        {result.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{result.location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
