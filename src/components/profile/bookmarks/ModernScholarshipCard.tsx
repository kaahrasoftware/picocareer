import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Building, 
  GraduationCap,
  Clock
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ScholarshipProfile {
  id: string;
  title: string;
  description: string;
  provider_name: string;
  amount?: number;
  deadline: string;
  status: string;
  application_url: string;
  category: string[];
  tags: string[];
  featured: boolean;
  bookmark_id: string;
}

interface ModernScholarshipCardProps {
  scholarship: ScholarshipProfile;
  onRemove: (scholarshipId: string) => void;
  isRemoving?: boolean;
}

export function ModernScholarshipCard({ 
  scholarship, 
  onRemove, 
  isRemoving = false 
}: ModernScholarshipCardProps) {
  const formatAmount = (amount?: number) => {
    if (!amount) return 'Amount varies';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Deadline passed';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getDeadlineUrgency = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'urgent';
    if (diffDays <= 7) return 'high';
    if (diffDays <= 30) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-destructive bg-destructive/10';
      case 'high': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950';
      default: return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950';
    }
  };

  const handleApply = () => {
    window.open(scholarship.application_url, '_blank');
  };

  const urgency = getDeadlineUrgency(scholarship.deadline);

  return (
    <div className="group relative">
      
      {/* Main card */}
      <div className="relative bg-card border border-border/50 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                {scholarship.title}
              </h3>
              {scholarship.featured && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  Featured
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <Building className="h-4 w-4" />
              <span>{scholarship.provider_name}</span>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleApply}
              className="gap-1 hover:bg-primary hover:text-primary-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              Apply
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  disabled={isRemoving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove bookmark?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove "{scholarship.title}" from your bookmarked scholarships.
                    You can always bookmark it again later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onRemove(scholarship.id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {scholarship.description}
        </p>

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-emerald-600">
              {formatAmount(scholarship.amount)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(urgency)}`}>
              {formatDeadline(scholarship.deadline)}
            </span>
          </div>
        </div>

        {/* Categories and Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {scholarship.category?.slice(0, 2).map((cat, index) => (
            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
              <GraduationCap className="h-3 w-3 mr-1" />
              {cat}
            </Badge>
          ))}
          {scholarship.tags?.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-secondary/50 text-secondary-foreground">
              {tag}
            </Badge>
          ))}
          {(scholarship.category?.length > 2 || scholarship.tags?.length > 2) && (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              +{(scholarship.category?.length || 0) + (scholarship.tags?.length || 0) - 4} more
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Badge
            variant={scholarship.status === 'Active' ? 'default' : 'secondary'}
            className={
              scholarship.status === 'Active' 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                : ''
            }
          >
            {scholarship.status}
          </Badge>
          
          <div className="text-xs text-muted-foreground">
            Bookmarked scholarship
          </div>
        </div>

      </div>
    </div>
  );
}