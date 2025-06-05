
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Star, 
  StarOff,
  Building,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CareerDetailsDialogProps {
  career: any;
  careerId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onToggleFeature: () => void;
}

export function CareerDetailsDialog({
  career: initialCareer,
  careerId,
  isOpen,
  isLoading: externalLoading,
  onClose,
  onEdit,
  onApprove,
  onReject,
  onDelete,
  onToggleFeature
}: CareerDetailsDialogProps) {
  const [career, setCareer] = useState(initialCareer);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCareerDetails = async () => {
      if (!careerId || !isOpen) {
        setCareer(null);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('careers')
          .select(`
            *,
            profiles (
              id,
              full_name,
              avatar_url,
              email
            )
          `)
          .eq('id', careerId)
          .single();

        if (error) throw error;
        setCareer(data);
      } catch (err) {
        console.error('Error loading career details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCareerDetails();
  }, [careerId, isOpen]);

  useEffect(() => {
    if (initialCareer) {
      setCareer(initialCareer);
    }
  }, [initialCareer]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Pending': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  if (!isOpen) return null;

  if (isLoading || externalLoading || !career) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Skeleton className="h-8 w-[300px]" />
          </DialogHeader>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={career.image_url} alt={career.title} />
                <AvatarFallback>
                  {career.title.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{career.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Created by {career.profiles?.full_name || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusBadgeVariant(career.status)}>
                {career.status}
              </Badge>
              {career.featured && (
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            {career.status === 'Pending' && (
              <>
                <Button onClick={onApprove} variant="outline" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button onClick={onReject} variant="outline" size="sm">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            
            <Button onClick={onToggleFeature} variant="outline" size="sm">
              {career.featured ? (
                <>
                  <StarOff className="h-4 w-4 mr-2" />
                  Unfeature
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Feature
                </>
              )}
            </Button>
            
            <Button onClick={onDelete} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>

          <Separator />

          {/* Career Details Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="compensation">Compensation</TabsTrigger>
              <TabsTrigger value="industry">Industry Info</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{career.description}</p>
              </div>
              
              {career.industry && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Industry
                  </h3>
                  <Badge variant="outline">{career.industry}</Badge>
                </div>
              )}

              {career.keywords && career.keywords.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {career.keywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4">
              {career.required_education && career.required_education.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Required Education
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {career.required_education.map((edu: string, index: number) => (
                      <Badge key={index} variant="outline">{edu}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {career.required_skills && career.required_skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {career.required_skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {career.required_tools && career.required_tools.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Required Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    {career.required_tools.map((tool: string, index: number) => (
                      <Badge key={index} variant="outline">{tool}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="compensation" className="space-y-4">
              {career.salary_range && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Salary Range
                  </h3>
                  <p className="text-lg">{career.salary_range}</p>
                </div>
              )}

              {career.growth_potential && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Growth Potential
                  </h3>
                  <p className="text-muted-foreground">{career.growth_potential}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="industry" className="space-y-4">
              {career.work_environment && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Work Environment</h3>
                  <p className="text-muted-foreground">{career.work_environment}</p>
                </div>
              )}

              {career.job_outlook && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Job Outlook</h3>
                  <p className="text-muted-foreground">{career.job_outlook}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Career Stats</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Complete Profile: {career.complete_career ? 'Yes' : 'No'}</p>
                    <p>Token Cost: {career.token_cost || 0}</p>
                    <p>Profile Views: {career.profiles_count || 0}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Dates</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Created: {new Date(career.created_at).toLocaleDateString()}</p>
                    <p>Updated: {new Date(career.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
