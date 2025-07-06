
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

interface MentorWithScore {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  position: string;
  company_name: string;
  location: string;
  bio: string;
  skills: string[];
  keywords: string[];
  fields_of_interest: string[];
  tools_used: string[];
  user_type: string;
  score: number;
  matchReasons: string[];
}

export const FindMentorsDialog = ({ 
  open, 
  onOpenChange, 
  recommendation 
}: FindMentorsDialogProps) => {
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  // Enhanced mentor matching with scoring algorithm
  const { data: mentors, isLoading, error } = useQuery({
    queryKey: ['enhanced-career-mentors', recommendation.title, recommendation.requiredSkills],
    queryFn: async () => {
      // Fetch all mentors first
      const { data: allMentors, error } = await supabase
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
          keywords,
          fields_of_interest,
          tools_used,
          user_type
        `)
        .eq('user_type', 'mentor');

      if (error) throw error;
      if (!allMentors) return [];

      const scoredMentors: MentorWithScore[] = allMentors.map(mentor => {
        let score = 0;
        const matchReasons: string[] = [];

        // Normalize text for better matching
        const normalizeText = (text: string) => text.toLowerCase().trim();
        const careerTitle = normalizeText(recommendation.title);
        const careerDescription = normalizeText(recommendation.description || '');
        
        // Extract keywords from career data
        const careerKeywords = [
          ...careerTitle.split(/[\s,-]+/),
          ...(recommendation.requiredSkills || []).map(normalizeText),
          ...careerDescription.split(/[\s,-]+/).filter(word => word.length > 3)
        ];

        // 1. Direct career title/position match (highest priority)
        if (mentor.position) {
          const mentorPosition = normalizeText(mentor.position);
          if (mentorPosition.includes(careerTitle) || careerTitle.includes(mentorPosition)) {
            score += 100;
            matchReasons.push('Exact career match');
          }
          
          // Partial position matching
          const positionWords = mentorPosition.split(/[\s,-]+/);
          const titleWords = careerTitle.split(/[\s,-]+/);
          const commonWords = positionWords.filter(word => 
            titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
          );
          if (commonWords.length > 0) {
            score += commonWords.length * 15;
            matchReasons.push('Similar position');
          }
        }

        // 2. Skills matching (high priority)
        if (recommendation.requiredSkills && mentor.skills) {
          const mentorSkills = mentor.skills.map(normalizeText);
          const requiredSkills = recommendation.requiredSkills.map(normalizeText);
          
          let skillMatches = 0;
          requiredSkills.forEach(skill => {
            const hasExactMatch = mentorSkills.some(mentorSkill => 
              mentorSkill === skill || mentorSkill.includes(skill) || skill.includes(mentorSkill)
            );
            if (hasExactMatch) {
              skillMatches++;
              score += 25;
            }
          });
          
          if (skillMatches > 0) {
            matchReasons.push(`${skillMatches} matching skills`);
          }
        }

        // 3. Fields of interest alignment (medium-high priority)
        if (mentor.fields_of_interest) {
          const mentorFields = mentor.fields_of_interest.map(normalizeText);
          let fieldMatches = 0;
          
          careerKeywords.forEach(keyword => {
            if (mentorFields.some(field => field.includes(keyword) || keyword.includes(field))) {
              fieldMatches++;
              score += 20;
            }
          });
          
          if (fieldMatches > 0) {
            matchReasons.push('Related field interests');
          }
        }

        // 4. Tools and technologies matching (medium priority)
        if (mentor.tools_used && recommendation.requiredSkills) {
          const mentorTools = mentor.tools_used.map(normalizeText);
          const requiredSkills = recommendation.requiredSkills.map(normalizeText);
          
          let toolMatches = 0;
          requiredSkills.forEach(skill => {
            if (mentorTools.some(tool => tool.includes(skill) || skill.includes(tool))) {
              toolMatches++;
              score += 15;
            }
          });
          
          if (toolMatches > 0) {
            matchReasons.push('Matching tools/technologies');
          }
        }

        // 5. Keywords matching (medium priority)
        if (mentor.keywords) {
          const mentorKeywords = mentor.keywords.map(normalizeText);
          let keywordMatches = 0;
          
          careerKeywords.forEach(keyword => {
            if (mentorKeywords.some(mentorKeyword => 
              mentorKeyword.includes(keyword) || keyword.includes(mentorKeyword)
            )) {
              keywordMatches++;
              score += 10;
            }
          });
          
          if (keywordMatches > 0) {
            matchReasons.push('Relevant keywords');
          }
        }

        // 6. Bio content matching (lower priority)
        if (mentor.bio) {
          const mentorBio = normalizeText(mentor.bio);
          let bioMatches = 0;
          
          careerKeywords.forEach(keyword => {
            if (keyword.length > 3 && mentorBio.includes(keyword)) {
              bioMatches++;
              score += 5;
            }
          });
          
          if (bioMatches > 0) {
            matchReasons.push('Relevant experience');
          }
        }

        // 7. Industry/field general matching
        const industryTerms = [
          'software', 'engineering', 'developer', 'analyst', 'manager', 'consultant',
          'designer', 'researcher', 'scientist', 'specialist', 'coordinator', 'director'
        ];
        
        if (mentor.position) {
          const mentorPosition = normalizeText(mentor.position);
          industryTerms.forEach(term => {
            if (careerTitle.includes(term) && mentorPosition.includes(term)) {
              score += 8;
              if (!matchReasons.includes('Same industry')) {
                matchReasons.push('Same industry');
              }
            }
          });
        }

        return {
          ...mentor,
          score,
          matchReasons: matchReasons.length > 0 ? matchReasons : ['General experience']
        };
      });

      // Filter mentors with meaningful scores and sort by relevance
      return scoredMentors
        .filter(mentor => mentor.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20); // Limit to top 20 matches
    },
    enabled: open,
  });

  const handleMentorClick = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    console.log('Selected mentor:', mentorId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Find Mentors for {recommendation.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Discover mentors with relevant experience in {recommendation.title} and related fields
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Finding relevant mentors...</span>
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
                No mentors found with relevant experience for "{recommendation.title}"
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
              <div className="text-sm text-muted-foreground mb-4">
                Found {mentors.length} mentors with relevant experience
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.map((mentor) => (
                  <Card 
                    key={mentor.id}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
                    onClick={() => handleMentorClick(mentor.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                          <AvatarImage 
                            src={mentor.avatar_url || ''} 
                            alt={`${mentor.first_name} ${mentor.last_name}`}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {mentor.first_name?.[0]}
                            {mentor.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">
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
                                <span className="truncate max-w-[100px]">{mentor.company_name}</span>
                              </div>
                            )}
                            {mentor.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate max-w-[80px]">{mentor.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Match reasons */}
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {mentor.matchReasons.slice(0, 2).map((reason, index) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary" 
                                  className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                                >
                                  {reason}
                                </Badge>
                              ))}
                              {mentor.matchReasons.length > 2 && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs px-2 py-0.5"
                                >
                                  +{mentor.matchReasons.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {mentor.skills && mentor.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {mentor.skills.slice(0, 3).map((skill, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
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

                          {/* Match score indicator */}
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">
                              {mentor.score > 80 ? 'Excellent' : 
                               mentor.score > 50 ? 'Good' : 
                               mentor.score > 20 ? 'Fair' : 'Basic'} match
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/mentor'}
                  className="px-6"
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
