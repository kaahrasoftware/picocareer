
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, BookOpen, Star, Tag, Award, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { ProfileDetailsDialog } from '@/components/ProfileDetailsDialog';
import { badgeStyles } from '@/components/career-details/BadgeStyles';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface MentorCardProps {
  id: string;
  name: string;
  position?: string;
  company?: string;
  location?: string;
  skills?: string[];
  keywords?: string[];
  rating?: number;
  totalRatings?: number;
  avatarUrl?: string;
  education?: string;
  hourlyRate?: number;
  onClick?: () => void;
  imageUrl?: string; // Added for backward compatibility
  topMentor?: boolean;
  sessionsHeld?: string;
  menteeCount?: number;
  connectionRate?: number;
}

export function MentorCard({
  id,
  name,
  position,
  company,
  location,
  skills = [],
  keywords = [],
  rating = 0,
  totalRatings = 0,
  avatarUrl,
  imageUrl, // Added to handle existing references
  education,
  hourlyRate,
  onClick,
  topMentor = false,
  sessionsHeld = "0",
  menteeCount = 0,
  connectionRate = 0
}: MentorCardProps) {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  // Use avatarUrl if provided, otherwise use imageUrl
  const displayAvatarUrl = avatarUrl || imageUrl;
  
  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={displayAvatarUrl} alt={name} />
              <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{name}</h3>
                {topMentor && (
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/10 text-primary"
                    title="Top Mentor"
                  >
                    <Award className="h-4 w-4" />
                  </div>
                )}
              </div>
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
        <CardContent className="flex-1 space-y-4">
          {education && (
            <p className="text-sm mb-3 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {education}
            </p>
          )}
          
          {skills.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                Skills
              </p>
              <div className="flex flex-wrap gap-1">
                {skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className={badgeStyles.tools}>
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
          
          {keywords && keywords.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                Keywords
              </p>
              <div className="flex flex-wrap gap-1">
                {keywords.slice(0, 3).map((keyword, index) => (
                  <Badge key={index} variant="outline" className={badgeStyles.keyword}>
                    {keyword}
                  </Badge>
                ))}
                {keywords.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{keywords.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col gap-3">
          {/* Stats grid */}
          <div className="w-full grid grid-cols-2 gap-2 text-sm">
            <TooltipProvider>
              {/* Rating */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Star className={`h-4 w-4 ${rating > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                    <span className="font-medium">
                      {rating > 0 ? rating.toFixed(1) : "-"}
                      {totalRatings > 0 && <span className="text-xs text-muted-foreground ml-1">({totalRatings})</span>}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Mentor rating</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Sessions held */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 justify-end">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{sessionsHeld || "0"}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Sessions completed</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Mentee count */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">{menteeCount || "0"}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Unique mentees</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Connection rate */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 justify-end">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">{connectionRate ? `${connectionRate}%` : "N/A"}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Connection success rate</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Price and view profile button */}
          <div className="flex items-center justify-between w-full">
            {hourlyRate !== undefined && (
              <span className="text-sm font-medium">${hourlyRate}/hour</span>
            )}
            <Button size="sm" onClick={() => setShowProfileDialog(true)}>
              View Profile
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ProfileDetailsDialog 
        userId={id}
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
      />
    </>
  );
}
