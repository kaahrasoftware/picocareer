
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, BookmarkX, DollarSign, Calendar, Building, GraduationCap } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthSession } from '@/hooks/useAuthSession';
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
} from '@/components/ui/alert-dialog';

interface ScholarshipData {
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
  eligibility_criteria?: any;
  academic_requirements?: any;
  application_process?: string;
  bookmarkId?: string;
}

export function ScholarshipBookmarks() {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: scholarships = [], isLoading } = useQuery({
    queryKey: ['bookmarked-scholarships', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select(`
          id,
          content_id
        `)
        .eq('profile_id', session.user.id)
        .eq('content_type', 'scholarship');

      if (error) throw error;
      
      if (!data || data.length === 0) return [];

      // Get scholarship details
      const scholarshipIds = data.map(bookmark => bookmark.content_id);
      const { data: scholarshipData, error: scholarshipError } = await supabase
        .from('scholarships')
        .select(`
          id,
          title,
          description,
          provider_name,
          amount,
          deadline,
          status,
          application_url,
          category,
          tags,
          featured,
          eligibility_criteria,
          academic_requirements,
          application_process
        `)
        .in('id', scholarshipIds);

      if (scholarshipError) throw scholarshipError;

      return scholarshipData?.map(scholarship => ({
        ...scholarship,
        bookmarkId: data.find(bookmark => bookmark.content_id === scholarship.id)?.id
      })) || [];
    },
    enabled: !!session?.user?.id
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: async (scholarshipId: string) => {
      if (!session?.user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('profile_id', session.user.id)
        .eq('content_id', scholarshipId)
        .eq('content_type', 'scholarship');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarked-scholarships'] });
      toast({
        title: 'Bookmark removed',
        description: 'Scholarship has been removed from your bookmarks.',
      });
      setRemovingId(null);
    },
    onError: (error) => {
      console.error('Error removing bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark. Please try again.',
        variant: 'destructive',
      });
      setRemovingId(null);
    },
  });

  const handleRemoveBookmark = (scholarshipId: string) => {
    setRemovingId(scholarshipId);
    removeBookmarkMutation.mutate(scholarshipId);
  };

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
      return `Deadline passed`;
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

  const getDeadlineColor = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600 bg-red-50';
    if (diffDays <= 7) return 'text-orange-600 bg-orange-50';
    if (diffDays <= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (scholarships.length === 0) {
    return (
      <div className="text-center py-12">
        <BookmarkX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarked scholarships</h3>
        <p className="text-gray-500">
          Start exploring scholarships and bookmark the ones you're interested in.
        </p>
        <Button className="mt-4" asChild>
          <a href="/scholarships">Browse Scholarships</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Bookmarked Scholarships ({scholarships.length})
        </h2>
      </div>

      <div className="grid gap-6">
        {scholarships.map((scholarship) => (
          <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl text-primary hover:text-primary/80">
                      {scholarship.title}
                    </CardTitle>
                    {scholarship.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{scholarship.provider_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-green-600">
                        {formatAmount(scholarship.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeadlineColor(scholarship.deadline)}`}>
                        {formatDeadline(scholarship.deadline)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(scholarship.application_url, '_blank')}
                    className="gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Apply
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={removingId === scholarship.id}
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
                          onClick={() => handleRemoveBookmark(scholarship.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-gray-700 mb-4 line-clamp-3">
                {scholarship.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {scholarship.category?.map((cat, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {cat}
                  </Badge>
                ))}
                {scholarship.tags?.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-50 text-gray-700">
                    {tag}
                  </Badge>
                ))}
                {scholarship.tags && scholarship.tags.length > 3 && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-500">
                    +{scholarship.tags.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Badge
                  variant={scholarship.status === 'Active' ? 'default' : 'secondary'}
                  className={scholarship.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {scholarship.status}
                </Badge>
                
                <div className="text-xs text-gray-500">
                  Bookmarked • View application details above
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
