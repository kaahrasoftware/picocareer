import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Building, Star, Users, ChevronRight, MessageCircle } from 'lucide-react';
import { MentorProfile } from './types';

interface ModernMentorCardProps {
  mentor: MentorProfile;
  onView?: (mentor: MentorProfile) => void;
}

export function ModernMentorCard({ mentor, onView }: ModernMentorCardProps) {
  const handleView = () => {
    if (onView) {
      onView(mentor);
    }
  };

  return (
    <div className="group relative">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Main card */}
      <div className="relative bg-card border border-border/50 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
        {/* Header with Avatar */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              <AvatarImage src={mentor.avatar_url} alt={mentor.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {mentor.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
              </AvatarFallback>
            </Avatar>
            {mentor.top_mentor && (
              <div className="absolute -top-1 -right-1 p-1 bg-yellow-500 rounded-full">
                <Star className="h-3 w-3 text-white fill-current" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                {mentor.full_name}
              </h3>
              {mentor.top_mentor && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                  Top Mentor
                </Badge>
              )}
            </div>
            {mentor.position && (
              <p className="text-sm text-muted-foreground font-medium line-clamp-1">
                {mentor.position}
              </p>
            )}
          </div>
        </div>

        {/* Company and Location */}
        <div className="space-y-2 mb-4">
          {mentor.company_name && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <Building className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="text-foreground font-medium line-clamp-1">{mentor.company_name}</span>
            </div>
          )}
          
          {mentor.location && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-green-100 rounded-md">
                <MapPin className="h-3.5 w-3.5 text-green-600" />
              </div>
              <span className="text-muted-foreground line-clamp-1">{mentor.location}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {mentor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {mentor.bio}
          </p>
        )}

        {/* Skills Badge */}
        {mentor.skills && mentor.skills.length > 0 && (
          <div className="mb-4">
            <Badge 
              variant="outline" 
              className="text-xs bg-primary/10 text-primary border-primary/20 hover:scale-105 transition-transform"
            >
              <Users className="h-3 w-3 mr-1" />
              {mentor.skills.length} skills
            </Badge>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            <span>Mentor</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleView}
            className="group/btn hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            View Profile
            <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Gradient border animation */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
      </div>
    </div>
  );
}