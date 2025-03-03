
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, BookOpen, Star } from 'lucide-react';

export interface MentorCardProps {
  id: string;
  name: string;
  position?: string;
  company?: string;
  location?: string;
  skills?: string[];
  rating?: number;
  avatarUrl?: string;
  education?: string;
  hourlyRate?: number;
  onClick?: () => void;
  imageUrl?: string; // Added for backward compatibility
}

export function MentorCard({
  id,
  name,
  position,
  company,
  location,
  skills = [],
  rating = 0,
  avatarUrl,
  imageUrl, // Added to handle existing references
  education,
  hourlyRate,
  onClick
}: MentorCardProps) {
  // Use avatarUrl if provided, otherwise use imageUrl
  const displayAvatarUrl = avatarUrl || imageUrl;
  
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={displayAvatarUrl} alt={name} />
            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            {position && company && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {position} at {company}
              </p>
            )}
            {location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {education && (
          <p className="text-sm mb-3 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {education}
          </p>
        )}
        {skills.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Skills</p>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex items-center justify-between">
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
        </div>
        {hourlyRate && (
          <span className="text-sm font-medium">${hourlyRate}/hour</span>
        )}
        <Button size="sm" onClick={onClick}>
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
