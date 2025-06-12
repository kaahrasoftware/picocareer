
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormField } from '@/components/forms/FormField';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthSession } from '@/hooks/useAuthSession';

const careerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  industry: z.string().optional(),
  salary_range: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['Pending', 'Approved', 'Rejected']).default('Pending'),
});

type CareerFormData = z.infer<typeof careerSchema>;

interface CareerFormProps {
  career?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CareerForm({ career, onSuccess, onCancel }: CareerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();

  const form = useForm<CareerFormData>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      title: career?.title || '',
      description: career?.description || '',
      industry: career?.industry || '',
      salary_range: career?.salary_range || '',
      featured: career?.featured || false,
      status: career?.status || 'Pending',
    },
  });

  const onSubmit = async (data: CareerFormData) => {
    if (!session?.user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to perform this action',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (career) {
        const { error } = await supabase
          .from('careers')
          .update({
            title: data.title,
            description: data.description,
            industry: data.industry,
            salary_range: data.salary_range,
            featured: data.featured,
            status: data.status,
            author_id: session.user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', career.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Career updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('careers')
          .insert({
            title: data.title,
            description: data.description,
            industry: data.industry,
            salary_range: data.salary_range,
            featured: data.featured,
            status: data.status,
            author_id: session.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Career created successfully',
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving career:', error);
      toast({
        title: 'Error',
        description: 'Failed to save career. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="details">Career Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Controller
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormField
                  name="title"
                  field={field}
                  label="Career Title"
                  type="text"
                  placeholder="e.g., Software Engineer"
                  required
                />
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormField
                  name="description"
                  field={field}
                  label="Description"
                  type="textarea"
                  placeholder="Detailed description of the career path"
                  required
                />
              )}
            />
            <Controller
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormField
                  name="industry"
                  field={field}
                  label="Industry"
                  type="text"
                  placeholder="e.g., Technology, Healthcare"
                />
              )}
            />
            <Controller
              control={form.control}
              name="salary_range"
              render={({ field }) => (
                <FormField
                  name="salary_range"
                  field={field}
                  label="Salary Range"
                  type="text"
                  placeholder="e.g., $70,000 - $120,000"
                />
              )}
            />
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Additional requirement fields will be added here
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Career detail fields will be added here
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Controller
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormField
                  name="featured"
                  field={field}
                  label="Featured Career"
                  type="checkbox"
                  description="Check if this career should be featured"
                />
              )}
            />
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormField
                  name="status"
                  field={field}
                  label="Status"
                  type="select"
                  options={[
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Rejected', label: 'Rejected' }
                  ]}
                />
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : career ? 'Update Career' : 'Create Career'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
