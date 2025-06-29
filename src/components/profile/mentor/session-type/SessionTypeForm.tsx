
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface SessionTypeFormProps {
  profileId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const sessionTypes = [
  'Know About my Career',
  'Resume/CV Review',
  'Campus France',
  'Undergrad Application',
  'Grad Application',
  'TOEFL Exam Prep Advice',
  'IELTS Exam Prep Advice',
  'Duolingo Exam Prep Advice',
  'SAT Exam Prep Advice',
  'GRE Exam Prep Advice',
  'GMAT Exam Prep Advice',
  'Interview Preparation',
  'Career Guidance',
  'Academic Planning',
  'Scholarship Applications',
  'Study Abroad Consultation',
  'Networking Tips',
  'LinkedIn Profile Review',
  'Personal Statement Review',
  'Cover Letter Review',
  'Portfolio Review',
  'Mock Interview',
  'Skill Development',
  'Career Transition',
  'Entrepreneurship Guidance',
  'Research Opportunities',
  'Internship Guidance',
  'Job Search Strategy',
  'Custom'
] as const;

type SessionType = typeof sessionTypes[number];

export function SessionTypeForm({ profileId, onSuccess, onCancel }: SessionTypeFormProps) {
  const [sessionType, setSessionType] = useState<SessionType>('Know About my Career');
  const [customType, setCustomType] = useState('');
  const [duration, setDuration] = useState(30);
  const [cost, setCost] = useState(0);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalSessionType = sessionType === 'Custom' ? customType : sessionType;
    
    if (!finalSessionType || !duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('mentor_session_types')
        .insert({
          profile_id: profileId,
          session_type: finalSessionType,
          duration_minutes: duration,
          cost_tokens: cost,
          description: description || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session type added successfully.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error adding session type:', error);
      toast({
        title: "Error",
        description: "Failed to add session type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Session Type</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="session-type">Session Type *</Label>
            <Select value={sessionType} onValueChange={(value: SessionType) => setSessionType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {sessionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sessionType === 'Custom' && (
            <div>
              <Label htmlFor="custom-type">Custom Session Type *</Label>
              <Input
                id="custom-type"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter custom session type"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="180"
                step="15"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="cost">Cost (tokens)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of this session type"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Adding...' : 'Add Session Type'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
