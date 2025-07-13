import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, DollarSign, Users, TrendingUp, Briefcase, ChevronRight } from 'lucide-react';
import { CareerProfile } from './types';

interface ModernCareerCardProps {
  career: CareerProfile;
  onView?: (career: CareerProfile) => void;
}

const getIndustryColor = (industry?: string): string => {
  if (!industry) return "bg-slate-100 text-slate-700 border-slate-200";
  
  const industryColors: Record<string, string> = {
    "Technology": "bg-primary/10 text-primary border-primary/20",
    "Healthcare": "bg-green-100 text-green-700 border-green-200",
    "Finance": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Education": "bg-blue-100 text-blue-700 border-blue-200",
    "Manufacturing": "bg-orange-100 text-orange-700 border-orange-200",
    "Retail": "bg-purple-100 text-purple-700 border-purple-200",
  };
  
  return industryColors[industry] || "bg-slate-100 text-slate-700 border-slate-200";
};

export function ModernCareerCard({ career, onView }: ModernCareerCardProps) {
  const handleView = () => {
    if (onView) {
      onView(career);
    }
  };

  return (
    <div className="group relative">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Main card */}
      <div className="relative bg-card border border-border/50 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2">
              {career.title}
            </h3>
            {career.industry && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getIndustryColor(career.industry)} hover:scale-105 transition-transform`}
              >
                <Building className="h-3 w-3 mr-1" />
                {career.industry}
              </Badge>
            )}
          </div>
          <div className="ml-3 p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Description */}
        {career.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
            {career.description}
          </p>
        )}

        {/* Salary and Stats */}
        <div className="space-y-3 mb-4">
          {career.salary_range && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-green-100 rounded-md">
                <DollarSign className="h-3.5 w-3.5 text-green-600" />
              </div>
              <span className="text-foreground font-medium">{career.salary_range}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <Users className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <span className="text-muted-foreground">
              {career.profiles_count || 0} professionals
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Career Path</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleView}
            className="group/btn hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Gradient border animation */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
      </div>
    </div>
  );
}