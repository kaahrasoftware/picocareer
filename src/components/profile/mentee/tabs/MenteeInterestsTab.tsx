
import { useState } from "react";
import { Plus, Edit, Trash2, Target, Book, Trophy, Heart, Building, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMenteeInterests } from "@/hooks/useMenteeData";
import type { Profile } from "@/types/database/profiles";
import type { InterestCategory } from "@/types/mentee-profile";

interface MenteeInterestsTabProps {
  profile: Profile;
  isEditing: boolean;
}

const CATEGORY_INFO: Record<InterestCategory, { color: string; icon: any; label: string }> = {
  career: { color: "bg-blue-100 text-blue-800", icon: Target, label: "Career" },
  academic: { color: "bg-green-100 text-green-800", icon: Book, label: "Academic" },
  extracurricular: { color: "bg-purple-100 text-purple-800", icon: Trophy, label: "Extracurricular" },
  hobby: { color: "bg-pink-100 text-pink-800", icon: Heart, label: "Hobby" },
  industry: { color: "bg-orange-100 text-orange-800", icon: Building, label: "Industry" },
  skill: { color: "bg-indigo-100 text-indigo-800", icon: Zap, label: "Skill" }
};

export function MenteeInterestsTab({ profile, isEditing }: MenteeInterestsTabProps) {
  const { data: interests = [], isLoading } = useMenteeInterests(profile.id);

  if (isLoading) {
    return <div>Loading interests...</div>;
  }

  // Group interests by category
  const groupedInterests = interests.reduce((acc, interest) => {
    if (!acc[interest.category]) {
      acc[interest.category] = [];
    }
    acc[interest.category].push(interest);
    return acc;
  }, {} as Record<InterestCategory, typeof interests>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Interests & Goals</h3>
        {isEditing && (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Interest
          </Button>
        )}
      </div>

      {interests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No interests added yet. {isEditing && "Click 'Add Interest' to share what you're passionate about."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(CATEGORY_INFO).map(([category, info]) => {
            const categoryInterests = groupedInterests[category as InterestCategory] || [];
            if (categoryInterests.length === 0) return null;

            const IconComponent = info.icon;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    {info.label} Interests
                    <Badge variant="outline">{categoryInterests.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {categoryInterests.map((interest) => (
                      <div key={interest.id} className="flex justify-between items-start p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{interest.interest_name}</h4>
                            <Badge className={info.color}>
                              {info.label}
                            </Badge>
                            {interest.proficiency_level && (
                              <Badge variant="outline">{interest.proficiency_level}</Badge>
                            )}
                          </div>
                          {interest.description && (
                            <p className="text-sm text-muted-foreground">
                              {interest.description}
                            </p>
                          )}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
