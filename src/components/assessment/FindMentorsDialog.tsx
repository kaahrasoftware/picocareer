
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, MapPin, Building, Star } from 'lucide-react';
import { CareerRecommendation } from '@/types/assessment';

interface FindMentorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: CareerRecommendation;
}

export const FindMentorsDialog = ({ 
  open, 
  onOpenChange, 
  recommendation 
}: FindMentorsDialogProps) => {
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  // Fetch mentors based on career title and required skills
  const { data: mentors, isLoading, error } = useQuery({
    queryKey: ['career-mentors', recommendation.title, recommendation.requiredSkills],
    queryFn: async () => {
      // First try to find mentors with matching position/career title
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          position,
          company_name,
          location,
          bio,
          skills,
          user_type
        `)
        .eq('user_type', 'mentor');

      // Search for mentors whose position includes the career title
      const { data: directMatches } = await query
        .or(`position.ilike.%${recommendation.title}%`)
        .limit(10);

      // If we have skills, also search for mentors with matching skills
      let skillMatches: any[] = [];
      if (recommendation.requiredSkills && recommendation.requiredSkills.length > 0) {
        const skillsQuery = recommendation.requiredSkills
          .map(skill => `skills.cs.{${skill}}`)
          .join(',');
        
        const { data: skillResults } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            avatar_url,
            position,
            company_name,
            location,
            bio,
            skills,
            user_type
          `)
          .eq('user_type', 'mentor')
          .or(skillsQuery)
          .limit(15);

        skillMatches = skillResults || [];
      }

      // Combine and deduplicate results
      const allMentors = [...(directMatches || []), ...skillMatches];
      const uniqueMentors = allMentors.filter((mentor, index, self) => 
        index === self.findIndex(m => m.id === mentor.id)
      );

      return uniqueMentors.slice(0, 12); // Limit to 12 mentors
    },
    enabled: open,
  });

  const handleMentorClick = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    // Here you could open another dialog or navigate to mentor profile
    console.log('Selected mentor:', mentorId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Find Mentors for {recommendation.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Connect with experienced professionals in {recommendation.title} and related fields
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Finding mentors...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Unable to load mentors at this time.</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/mentor'}
                className="mt-4"
              >
                Browse All Mentors
              </Button>
            </div>
          ) : !mentors || mentors.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">
                No mentors found specifically for "{recommendation.title}"
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/mentor'}
              >
                Browse All Mentors
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.map((mentor) => (
                  <Card 
                    key={mentor.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleMentorClick(mentor.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={mentor.avatar_url || ''} 
                            alt={`${mentor.first_name} ${mentor.last_name}`}
                          />
                          <AvatarFallback>
                            {mentor.first_name?.[0]}
                            {mentor.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {mentor.first_name} {mentor.last_name}
                          </h3>
                          
                          {mentor.position && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {mentor.position}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            {mentor.company_name && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                <span className="truncate">{mentor.company_name}</span>
                              </div>
                            )}
                            {mentor.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{mentor.location}</span>
                              </div>
                            )}
                          </div>

                          {mentor.skills && mentor.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {mentor.skills.slice(0, 3).map((skill, index) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary" 
                                  className="text-xs px-2 py-0.5"
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {mentor.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  +{mentor.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/mentor'}
                >
                  View All Mentors
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
