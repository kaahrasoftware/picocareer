
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import type { StepProps } from '../types';

const organizationSizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1001+', label: '1000+ employees' },
];

export function StepTwo({ form, data }: StepProps) {
  const [newFocusArea, setNewFocusArea] = React.useState('');

  const addFocusArea = () => {
    if (newFocusArea.trim()) {
      const currentAreas = form.getValues('focus_areas') || [];
      form.setValue('focus_areas', [...currentAreas, newFocusArea.trim()]);
      setNewFocusArea('');
    }
  };

  const removeFocusArea = (index: number) => {
    const currentAreas = form.getValues('focus_areas') || [];
    form.setValue('focus_areas', currentAreas.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="organization_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Size</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizationSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="established_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Established Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="2000" 
                    min="1800"
                    max={new Date().getFullYear()}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <FormLabel>Focus Areas</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Add focus area"
                value={newFocusArea}
                onChange={(e) => setNewFocusArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFocusArea())}
              />
              <Button type="button" variant="outline" onClick={addFocusArea}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.focus_areas || []).map((area, index) => (
                <Badge key={index} variant="secondary" className="gap-2">
                  {area}
                  <button
                    type="button"
                    onClick={() => removeFocusArea(index)}
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
            name="current_programs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Programs/Initiatives</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your current programs or initiatives..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accreditation_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accreditation Information</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="List any relevant accreditations or certifications..." 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
