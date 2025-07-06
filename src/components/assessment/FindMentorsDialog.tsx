
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { CareerRecommendation } from '@/types/assessment';
import { Users, MapPin, Building, ExternalLink, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileDetailsDialog } from '@/components/ProfileDetailsDialog';

interface FindMentorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: CareerRecommendation;
}

interface MentorProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  skills: string[] | null;
  keywords: string[] | null;
  fields_of_interest: string[] | null;
  tools_used: string[] | null;
  top_mentor: boolean | null;
  years_of_experience: number | null;
  company: { name: string } | null;
  school: { name: string } | null;
}

export const FindMentorsDialog = ({ open, onOpenChange, recommendation }: FindMentorsDialogProps) => {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const navigate = useNavigate();

  const searchMentors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          position,
          location,
          bio,
          avatar_url,
          skills,
          keywords,
          fields_of_interest,
          tools_used,
          top_mentor,
          years_of_experience,
          company:companies(name),
          school:schools(name)
        `)
        .eq('user_type', 'mentor')
        .limit(20);

      if (error) {
        console.error('Error fetching mentors:', error);
        setMentors([]);
        return;
      }

      if (!data) {
        setMentors([]);
        return;
      }

      // Enhanced mentor matching with scoring
      const scoredMentors = data.map((mentor) => {
        let score = 0;
        let matchReasons: string[] = [];

        // Direct career title/position match (highest priority)
        if (mentor.position) {
          const positionLower = mentor.position.toLowerCase();
          const titleLower = recommendation.title.toLowerCase();
          if (positionLower.includes(titleLower) || titleLower.includes(positionLower)) {
            score += 100;
            matchReasons.push('Direct career match');
          }
        }

        // Skills matching (high priority)
        if (mentor.skills && recommendation.requiredSkills) {
          const mentorSkills = mentor.skills.map(skill => skill.toLowerCase());
          const requiredSkills = recommendation.requiredSkills.map(skill => skill.toLowerCase());
          
          const exactMatches = mentorSkills.filter(skill => 
            requiredSkills.some(reqSkill => 
              skill.includes(reqSkill) || reqSkill.includes(skill)
            )
          ).length;
          
          if (exactMatches > 0) {
            score += exactMatches * 20;
            matchReasons.push(`${exactMatches} matching skills`);
          }
        }

        // Fields of interest matching (medium-high priority)
        if (mentor.fields_of_interest) {
          const fieldsLower = mentor.fields_of_interest.map(field => field.toLowerCase());
          const titleWords = recommendation.title.toLowerCase().split(' ');
          const descWords = recommendation.description.toLowerCase().split(' ');
          const allWords = [...titleWords, ...descWords];
          
          const fieldMatches = fieldsLower.filter(field => 
            allWords.some(word => field.includes(word) || word.includes(field))
          ).length;
          
          if (fieldMatches > 0) {
            score += fieldMatches * 15;
            matchReasons.push('Related field of interest');
          }
        }

        // Tools/Technology matching (medium priority)
        if (mentor.tools_used && recommendation.requiredSkills) {
          const toolsLower = mentor.tools_used.map(tool => tool.toLowerCase());
          const skillsLower = recommendation.requiredSkills.map(skill => skill.toLowerCase());
          
          const toolMatches = toolsLower.filter(tool => 
            skillsLower.some(skill => tool.includes(skill) || skill.includes(tool))
          ).length;
          
          if (toolMatches > 0) {
            score += toolMatches * 10;
            matchReasons.push('Related tools/technologies');
          }
        }

        // Keywords matching (medium priority)
        if (mentor.keywords) {
          const keywordsLower = mentor.keywords.map(keyword => keyword.toLowerCase());
          const titleLower = recommendation.title.toLowerCase();
          const descLower = recommendation.description.toLowerCase();
          
          const keywordMatches = keywordsLower.filter(keyword => 
            titleLower.includes(keyword) || descLower.includes(keyword) ||
            keyword.includes(titleLower.split(' ')[0])
          ).length;
          
          if (keywordMatches > 0) {
            score += keywordMatches * 8;
            matchReasons.push('Relevant keywords');
          }
        }

        // Bio content matching (lower priority)
        if (mentor.bio) {
          const bioLower = mentor.bio.toLowerCase();
          const titleWords = recommendation.title.toLowerCase().split(' ');
          const bioMatches = titleWords.filter(word => 
            word.length > 3 && bioLower.includes(word)
          ).length;
          
          if (bioMatches > 0) {
            score += bioMatches * 5;
            matchReasons.push('Bio relevance');
          }
        }

        // Industry/position partial matching (bonus points)
        if (mentor.position) {
          const positionWords = mentor.position.toLowerCase().split(' ');
          const titleWords = recommendation.title.toLowerCase().split(' ');
          const wordMatches = positionWords.filter(word => 
            word.length > 3 && titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
          ).length;
          
          if (wordMatches > 0) {
            score += wordMatches * 5;
            matchReasons.push('Related position');
          }
        }

        // Bonus for top mentors
        if (mentor.top_mentor) {
          score += 10;
        }

        // Bonus for experienced mentors
        if (mentor.years_of_experience && mentor.years_of_experience > 5) {
          score += 5;
        }

        return {
          ...mentor,
          score,
          matchReasons
        };
      });

      // Sort by score and filter out mentors with no relevance
      const relevantMentors = scoredMentors
        .filter(mentor => mentor.score > 0)
        .sort((a, b) => b.score - a.score);

      setMentors(relevantMentors.slice(0, 12)); // Limit to top 12 matches
    } catch (error) {
      console.error('Error in searchMentors:', error);
      setMentors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      searchMentors();
    }
  }, [open, recommendation]);

  const handleMentorClick = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setProfileDialogOpen(true);
  };

  const handleBrowseAllMentors = () => {
    onOpenChange(false);
    navigate('/mentor');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Find Mentors for {recommendation.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <p className="text-muted-foreground">
              Connect with experienced mentors who can guide you in your {recommendation.title} career journey.
            </p>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : mentors.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentors.map((mentor) => (
                    <div
                      key={mentor.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleMentorClick(mentor.id)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={mentor.avatar_url || ''} alt={`${mentor.first_name} ${mentor.last_name}`} />
                          <AvatarFallback>
                            {mentor.first_name?.[0]}{mentor.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">
                              {mentor.first_name} {mentor.last_name}
                            </h3>
                            {mentor.top_mentor && (
                              <Badge className="bg-gradient-to-r from-primary/80 to-primary text-white hover:from-primary hover:to-primary/90 flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                Top
                              </Badge>
                            )}
                          </div>
                          {mentor.position && (
                            <p className="text-sm text-muted-foreground truncate">
                              {mentor.position}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            {mentor.company?.name && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                <span className="truncate">{mentor.company.name}</span>
                              </div>
                            )}
                            {mentor.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{mentor.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {mentor.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {mentor.bio}
                        </p>
                      )}

                      {mentor.skills && mentor.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {mentor.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {mentor.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{mentor.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center pt-4 border-t">
                  <Button onClick={handleBrowseAllMentors} variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Browse All Mentors
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No specific mentors found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find mentors specifically matching "{recommendation.title}", but you can browse all mentors to find someone who can help with your career goals.
                </p>
                <Button onClick={handleBrowseAllMentors}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Browse All Mentors
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedMentorId && (
        <ProfileDetailsDialog
          userId={selectedMentorId}
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
        />
      )}
    </>
  );
};
