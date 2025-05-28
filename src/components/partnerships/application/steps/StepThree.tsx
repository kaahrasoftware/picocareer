
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import type { StepProps } from '../types';

const collaborationOptions = [
  'Student career guidance',
  'Mentorship programs',
  'Job placement services',
  'Curriculum development',
  'Faculty training',
  'Research partnerships',
  'Technology integration',
  'Event collaboration',
  'Marketing partnerships',
  'Data sharing',
];

export function StepThree({ form, data }: StepProps) {
  const [newCollaborationArea, setNewCollaborationArea] = React.useState('');

  const addCollaborationArea = (area: string) => {
    const currentAreas = form.getValues('collaboration_areas') || [];
    if (!currentAreas.includes(area)) {
      form.setValue('collaboration_areas', [...currentAreas, area]);
    }
  };

  const removeCollaborationArea = (index: number) => {
    const currentAreas = form.getValues('collaboration_areas') || [];
    form.setValue('collaboration_areas', currentAreas.filter((_, i) => i !== index));
  };

  const addCustomCollaborationArea = () => {
    if (newCollaborationArea.trim()) {
      addCollaborationArea(newCollaborationArea.trim());
      setNewCollaborationArea('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Partnership Goals & Collaboration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="partnership_goals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partnership Goals *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe what you hope to achieve through this partnership..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Areas of Collaboration</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {collaborationOptions.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={(data.collaboration_areas || []).includes(option) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if ((data.collaboration_areas || []).includes(option)) {
                      const index = (data.collaboration_areas || []).indexOf(option);
                      removeCollaborationArea(index);
                    } else {
                      addCollaborationArea(option);
                    }
                  }}
                  className="justify-start text-xs"
                >
                  {option}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add custom collaboration area"
                value={newCollaborationArea}
                onChange={(e) => setNewCollaborationArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCollaborationArea())}
              />
              <Button type="button" variant="outline" onClick={addCustomCollaborationArea}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(data.collaboration_areas || []).map((area, index) => (
                <Badge key={index} variant="secondary" className="gap-2">
                  {area}
                  <button
                    type="button"
                    onClick={() => removeCollaborationArea(index)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="expected_outcomes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Outcomes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What specific outcomes do you expect from this partnership?" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="student_population"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student/Member Population</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Number of students/members" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Input placeholder="Who will benefit from this partnership?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
