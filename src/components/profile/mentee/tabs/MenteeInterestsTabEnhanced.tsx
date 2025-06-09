
import { useState } from "react";
import { Plus, Edit, Trash2, Target, Book, Trophy, Heart, Building, Zap, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMenteeInterestsEnhanced, useMenteeDataMutationsEnhanced, type EnhancedMenteeInterest } from "@/hooks/useMenteeDataEnhanced";
import { MenteeInterestForm } from "../forms/MenteeInterestForm";
import type { Profile } from "@/types/database/profiles";
import type { InterestCategory } from "@/types/mentee-profile";

interface MenteeInterestsTabEnhancedProps {
  profile: Profile;
  isEditing: boolean;
}

const CATEGORY_INFO: Record<InterestCategory, { color: string; bgColor: string; icon: any; label: string; description: string }> = {
  career: { 
    color: "text-blue-700", 
    bgColor: "bg-blue-50 border-blue-200", 
    icon: Target, 
    label: "Career Goals", 
    description: "Professional aspirations and career paths" 
  },
  academic: { 
    color: "text-green-700", 
    bgColor: "bg-green-50 border-green-200", 
    icon: Book, 
    label: "Academic Interests", 
    description: "Fields of study and educational pursuits" 
  },
  extracurricular: { 
    color: "text-purple-700", 
    bgColor: "bg-purple-50 border-purple-200", 
    icon: Trophy, 
    label: "Extracurricular Activities", 
    description: "School clubs, teams, and organized activities" 
  },
  hobby: { 
    color: "text-pink-700", 
    bgColor: "bg-pink-50 border-pink-200", 
    icon: Heart, 
    label: "Personal Hobbies", 
    description: "Personal interests and recreational activities" 
  },
  industry: { 
    color: "text-orange-700", 
    bgColor: "bg-orange-50 border-orange-200", 
    icon: Building, 
    label: "Industry Interests", 
    description: "Sectors and business areas of interest" 
  },
  skill: { 
    color: "text-indigo-700", 
    bgColor: "bg-indigo-50 border-indigo-200", 
    icon: Zap, 
    label: "Skills & Abilities", 
    description: "Technical and soft skills you're developing" 
  }
};

const PROFICIENCY_COLORS = {
  beginner: "bg-gray-100 text-gray-700 border-gray-200",
  intermediate: "bg-blue-100 text-blue-700 border-blue-200",
  advanced: "bg-green-100 text-green-700 border-green-200",
  expert: "bg-purple-100 text-purple-700 border-purple-200"
};

function InterestCard({ 
  interest, 
  categoryInfo, 
  isEditing, 
  onEdit, 
  onDelete 
}: {
  interest: EnhancedMenteeInterest;
  categoryInfo: typeof CATEGORY_INFO[InterestCategory];
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const IconComponent = categoryInfo.icon;
  const proficiencyColor = interest.proficiency_level ? 
    PROFICIENCY_COLORS[interest.proficiency_level as keyof typeof PROFICIENCY_COLORS] || "bg-gray-100 text-gray-700 border-gray-200" 
    : null;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md border-2 ${categoryInfo.bgColor} group`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-lg bg-white shadow-sm border`}>
              <IconComponent className={`h-5 w-5 ${categoryInfo.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                {interest.display_name}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className={`text-xs font-medium ${categoryInfo.color} bg-white border-current`}>
                  {categoryInfo.label}
                </Badge>
                {interest.proficiency_level && (
                  <Badge variant="outline" className={`text-xs font-medium border ${proficiencyColor}`}>
                    <Star className="h-3 w-3 mr-1" />
                    {interest.proficiency_level.charAt(0).toUpperCase() + interest.proficiency_level.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {isEditing && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-8 w-8 p-0 hover:bg-white/80"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      {interest.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 leading-relaxed">
            {interest.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

export function MenteeInterestsTabEnhanced({ profile, isEditing }: MenteeInterestsTabEnhancedProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingInterest, setEditingInterest] = useState<EnhancedMenteeInterest | null>(null);
  
  const { data: interests = [], isLoading } = useMenteeInterestsEnhanced(profile.id);
  const { deleteInterest } = useMenteeDataMutationsEnhanced();

  const handleEdit = (interest: EnhancedMenteeInterest) => {
    setEditingInterest(interest);
    setShowForm(true);
  };

  const handleDelete = async (interestId: string) => {
    if (window.confirm('Are you sure you want to delete this interest?')) {
      deleteInterest.mutate(interestId);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInterest(null);
  };

  const handleAddInterest = () => {
    setEditingInterest(null);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Interests & Goals</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Group interests by category
  const groupedInterests = interests.reduce((acc, interest) => {
    if (!acc[interest.category as InterestCategory]) {
      acc[interest.category as InterestCategory] = [];
    }
    acc[interest.category as InterestCategory].push(interest);
    return acc;
  }, {} as Record<InterestCategory, EnhancedMenteeInterest[]>);

  const totalInterests = interests.length;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Interests & Goals</h3>
          <p className="text-gray-600">
            {totalInterests === 0 
              ? "Share your interests to help mentors understand your passions and goals"
              : `You have ${totalInterests} interest${totalInterests === 1 ? '' : 's'} across ${Object.keys(groupedInterests).length} categories`
            }
          </p>
        </div>
        {isEditing && (
          <Button onClick={handleAddInterest} size="lg" className="shadow-md hover:shadow-lg transition-shadow">
            <Plus className="h-5 w-5 mr-2" />
            Add Interest
          </Button>
        )}
      </div>

      {/* Content Section */}
      {totalInterests === 0 ? (
        <Card className="text-center p-12 border-dashed border-2 border-gray-200 bg-gray-50/50">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No interests added yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {isEditing 
                  ? "Click 'Add Interest' to share what you're passionate about and help mentors understand your goals."
                  : "This profile hasn't shared any interests yet."
                }
              </p>
            </div>
            {isEditing && (
              <Button onClick={handleAddInterest} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(CATEGORY_INFO).map(([category, info]) => {
            const categoryInterests = groupedInterests[category as InterestCategory] || [];
            if (categoryInterests.length === 0) return null;

            const IconComponent = info.icon;

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className={`p-2 rounded-lg ${info.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${info.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{info.label}</h4>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1">
                    {categoryInterests.length}
                  </Badge>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryInterests.map((interest) => (
                    <InterestCard
                      key={interest.id}
                      interest={interest}
                      categoryInfo={info}
                      isEditing={isEditing}
                      onEdit={() => handleEdit(interest)}
                      onDelete={() => handleDelete(interest.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <MenteeInterestForm
          menteeId={profile.id}
          interest={editingInterest ? {
            ...editingInterest,
            category: editingInterest.category as any,
            interest_name: editingInterest.display_name
          } : null}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
