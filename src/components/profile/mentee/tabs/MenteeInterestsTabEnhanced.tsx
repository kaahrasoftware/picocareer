import React, { useState } from 'react';
import { Plus, X, BookOpen, Briefcase, Heart, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InterestCategory } from "@/types/mentee-profile";

interface MenteeInterestsTabEnhancedProps {
  profileId: string;
  isEditing: boolean;
}

const categoryConfig: Record<InterestCategory, { color: string; bgColor: string; icon: any; label: string; description: string }> = {
  academic: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: BookOpen,
    label: 'Academic',
    description: 'Subjects and fields of study'
  },
  professional: {
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    icon: Briefcase,
    label: 'Professional',
    description: 'Career and work-related interests'
  },
  personal: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: Heart,
    label: 'Personal',
    description: 'Hobbies and personal interests'
  },
  extracurricular: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: Trophy,
    label: 'Extracurricular',
    description: 'Activities and clubs'
  },
  career: {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    icon: Target,
    label: 'Career Goals',
    description: 'Future career aspirations'
  }
};

export function MenteeInterestsTabEnhanced({ profileId, isEditing }: MenteeInterestsTabEnhancedProps) {
  

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

      {Object.entries(categoryConfig).map(([category, config]) => (
        <Card key={category} className={config.bgColor}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${config.color}`}>
              <config.icon className="h-5 w-5" />
              {config.label}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No {config.label.toLowerCase()} interests added yet.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
