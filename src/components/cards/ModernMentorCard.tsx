
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, BookOpen, Star, Tag, Award, Clock, MessageCircle, GraduationCap } from 'lucide-react';
import { ProfileDetailsDialog } from '@/components/ProfileDetailsDialog';
import { MentorCardProps } from '@/components/MentorCard';

export function ModernMentorCard({
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
  imageUrl,
  education,
  hourlyRate,
  onClick,
  topMentor = false,
  careerTitle // Now this prop is properly included
}: MentorCardProps) {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const displayAvatarUrl = avatarUrl || imageUrl;

  const handleViewProfile = () => {
    if (onClick) {
      onClick();
    } else {
      setShowProfileDialog(true);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Only show career title if it exists and is different from position
  const shouldShowCareerTitle = careerTitle && careerTitle !== position;

  return <>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-white to-cyan-50 group">
        {/* Top accent line */}
        {topMentor && <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500" />}
        
        <CardHeader className="pb-4 relative">
          {topMentor && <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shadow-lg">
                <Award className="h-3 w-3 mr-1" />
                Top Mentor
              </Badge>
            </div>}
          
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <AvatarImage src={displayAvatarUrl} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full border-2 border-white shadow-sm" title="Available" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{name}</h3>
              {position && (
                <p className="text-sm text-blue-700 font-medium mb-1 flex items-center gap-1 line-clamp-1">
                  <Briefcase className="h-3 w-3 flex-shrink-0" />
                  {position} {company && `at ${company}`}
                </p>
              )}
              {location && (
                <p className="text-xs text-gray-600 flex items-center gap-1 line-clamp-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  {location}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4 px-6">
          {/* Career Title Section */}
          {shouldShowCareerTitle && <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Career Field</span>
              </div>
              <p className="text-sm font-medium text-blue-700 line-clamp-1">{careerTitle}</p>
            </div>}

          {education && <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-cyan-600" />
                <span className="text-xs font-medium text-blue-700">Education</span>
              </div>
              <p className="text-sm font-medium text-blue-700 line-clamp-1">{education}</p>
            </div>}
          
          {/* Rating and Price Section */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-700">Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-yellow-800">
                  {rating > 0 ? rating.toFixed(1) : "New"}
                </span>
                {totalRatings > 0 && <span className="text-xs text-yellow-600">({totalRatings})</span>}
              </div>
            </div>
            
            {hourlyRate && <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-700" />
                  <span className="text-xs font-medium text-blue-700">Rate</span>
                </div>
                <p className="font-semibold text-blue-700">${hourlyRate}/hr</p>
              </div>}
          </div>
          
          {/* Skills Section */}
          {skills.length > 0 && <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-cyan-600" />
                <span className="text-xs font-medium text-gray-700">Expertise</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {skills.slice(0, 3).map((skill, index) => <Badge key={index} variant="outline" className="text-xs bg-cyan-50 border-cyan-300 text-blue-700 hover:bg-cyan-100 transition-colors">
                    {skill}
                  </Badge>)}
                {skills.length > 3 && <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                    +{skills.length - 3} more
                  </Badge>}
              </div>
            </div>}
          
          {/* Keywords Section */}
          {keywords.length > 0 && <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-700" />
                <span className="text-xs font-medium text-gray-700">Specializations</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {keywords.slice(0, 3).map((keyword, index) => <Badge key={index} variant="outline" className="text-xs bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors">
                    {keyword}
                  </Badge>)}
                {keywords.length > 3 && <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                    +{keywords.length - 3} more
                  </Badge>}
              </div>
            </div>}
        </CardContent>

        <CardFooter className="border-t bg-gray-50/50 pt-4 pb-4 px-6">
          <Button onClick={handleViewProfile} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <MessageCircle className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        </CardFooter>
      </Card>

      <ProfileDetailsDialog userId={id} open={showProfileDialog} onOpenChange={setShowProfileDialog} />
    </>;
}
