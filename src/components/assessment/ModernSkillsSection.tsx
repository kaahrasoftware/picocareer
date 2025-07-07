
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ModernContentCard } from './ModernContentCard';
import { Zap } from 'lucide-react';

interface ModernSkillsSectionProps {
  skills: string[];
  title: string;
  icon?: React.ReactNode;
}

export const ModernSkillsSection = ({ 
  skills, 
  title, 
  icon = <Zap className="h-5 w-5 text-blue-600" /> 
}: ModernSkillsSectionProps) => {
  if (!skills || skills.length === 0) return null;

  return (
    <ModernContentCard title={title} icon={icon} variant="gradient">
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <Badge 
            key={index} 
            variant="secondary"
            className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 px-3 py-1"
          >
            {skill}
          </Badge>
        ))}
      </div>
    </ModernContentCard>
  );
};
