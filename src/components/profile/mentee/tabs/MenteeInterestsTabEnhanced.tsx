
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InterestCategory } from '@/types/mentee-profile';
import { useMenteeInterestsEnhanced, useMenteeDataMutationsEnhanced } from '@/hooks/useMenteeDataEnhanced';
import { Plus, Edit2, Trash2, Briefcase, GraduationCap, Users, Heart, Building, Wrench } from 'lucide-react';

interface MenteeInterestsTabEnhancedProps {
  menteeId: string;
}

const categoryConfig: Record<InterestCategory, { color: string; bgColor: string; icon: any; label: string; description: string }> = {
  career: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Briefcase, label: 'Career', description: 'Professional career interests' },
  academic: { color: 'text-green-700', bgColor: 'bg-green-100', icon: GraduationCap, label: 'Academic', description: 'Academic subjects and fields' },
  extracurricular: { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Users, label: 'Extracurricular', description: 'Activities and clubs' },
  hobby: { color: 'text-pink-700', bgColor: 'bg-pink-100', icon: Heart, label: 'Hobby', description: 'Personal hobbies and interests' },
  industry: { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Building, label: 'Industry', description: 'Industry sectors of interest' },
  skill: { color: 'text-cyan-700', bgColor: 'bg-cyan-100', icon: Wrench, label: 'Skill', description: 'Skills you want to develop' }
};

export function MenteeInterestsTabEnhanced({ menteeId }: MenteeInterestsTabEnhancedProps) {
  const { data: interests = [], isLoading } = useMenteeInterestsEnhanced(menteeId);
  const { deleteInterest } = useMenteeDataMutationsEnhanced();
  const [selectedCategory, setSelectedCategory] = useState<InterestCategory | 'all'>('all');

  const filteredInterests = selectedCategory === 'all' 
    ? interests 
    : interests.filter(interest => interest.category === selectedCategory);

  const groupedInterests = interests.reduce((acc, interest) => {
    if (!acc[interest.category]) {
      acc[interest.category] = [];
    }
    acc[interest.category].push(interest);
    return acc;
  }, {} as Record<InterestCategory, typeof interests>);

  const handleDeleteInterest = (interestId: string) => {
    if (window.confirm('Are you sure you want to delete this interest?')) {
      deleteInterest.mutate(interestId);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading interests...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Interests</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Interest
          </Button>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All ({interests.length})
            </Button>
            {Object.entries(categoryConfig).map(([category, config]) => {
              const count = groupedInterests[category as InterestCategory]?.length || 0;
              const Icon = config.icon;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category as InterestCategory)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-3 w-3" />
                  {config.label} ({count})
                </Button>
              );
            })}
          </div>

          {/* Interests Display */}
          {filteredInterests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No interests found</p>
              <p className="text-sm">Add some interests to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedInterests).map(([category, categoryInterests]) => {
                if (!categoryInterests || categoryInterests.length === 0) return null;
                if (selectedCategory !== 'all' && selectedCategory !== category) return null;

                const config = categoryConfig[category as InterestCategory];
                const Icon = config.icon;

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <h3 className="font-semibold text-lg">{config.label}</h3>
                      <Badge variant="secondary" className="ml-auto">
                        {categoryInterests.length}
                      </Badge>
                    </div>
                    <div className="grid gap-3">
                      {categoryInterests.map((interest) => (
                        <Card key={interest.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${config.bgColor} ${config.color} border-0`}>
                                  {config.label}
                                </Badge>
                                <h4 className="font-medium">{interest.display_name}</h4>
                              </div>
                              {interest.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {interest.description}
                                </p>
                              )}
                              {interest.proficiency_level && (
                                <Badge variant="outline">
                                  {interest.proficiency_level}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteInterest(interest.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
