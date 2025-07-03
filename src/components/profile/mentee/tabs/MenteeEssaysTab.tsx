
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Calendar, Edit2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MenteeEssaysTabProps {
  profileId: string;
}

interface MenteeEssayResponse {
  id: string;
  essay_prompt_id: string;
  response_text: string;
  status: 'draft' | 'submitted' | 'reviewed';
  created_at: string;
  updated_at: string;
  essay_prompts: {
    title: string;
    prompt_text: string;
    category: string;
    word_limit?: number;
  };
}

export function MenteeEssaysTab({ profileId }: MenteeEssaysTabProps) {
  const [selectedEssay, setSelectedEssay] = useState<MenteeEssayResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: essays, isLoading, refetch } = useQuery({
    queryKey: ['mentee-essays', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentee_essay_responses')
        .select(`
          *,
          essay_prompts (
            title,
            prompt_text,
            category,
            word_limit
          )
        `)
        .eq('profile_id', profileId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as MenteeEssayResponse[];
    },
    enabled: !!profileId
  });

  const handleSaveEssay = async (response: Partial<MenteeEssayResponse>) => {
    if (!profileId) return;

    try {
      if (response.id) {
        // Update existing essay
        const { error } = await supabase
          .from('mentee_essay_responses')
          .update(response)
          .eq('id', response.id);
        if (error) throw error;
      } else {
        // Insert new essay
        const { error } = await supabase
          .from('mentee_essay_responses')
          .insert({
            profile_id: profileId,
            essay_prompt_id: response.essay_prompt_id,
            response_text: response.response_text,
            status: response.status || 'draft'
          });
        if (error) throw error;
      }
      await refetch();
      setShowForm(false);
      setSelectedEssay(null);
    } catch (error) {
      console.error('Error saving essay:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'reviewed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div>Loading essays...</div>;
  }

  if (showForm) {
    return (
      <div className="p-4">
        <h3>Essay Form Coming Soon</h3>
        <Button onClick={() => setShowForm(false)} variant="outline">
          Back to Essays
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Essays</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Essay
        </Button>
      </div>

      {essays && essays.length > 0 ? (
        <div className="grid gap-4">
          {essays.map((essay) => (
            <Card key={essay.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {essay.essay_prompts.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(essay.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(essay.status)}`}>
                        {essay.status.charAt(0).toUpperCase() + essay.status.slice(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {essay.essay_prompts.category}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedEssay(essay);
                      setShowForm(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {essay.essay_prompts.prompt_text.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Updated {formatDistanceToNow(new Date(essay.updated_at))} ago</span>
                  </div>
                  {essay.essay_prompts.word_limit && (
                    <span>Limit: {essay.essay_prompts.word_limit} words</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No essays yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start working on your essays to strengthen your applications
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Write Your First Essay
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
