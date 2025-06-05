
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormField } from '@/components/forms/FormField';
import { careerFormFields } from '@/components/forms/career/CareerFormFields';
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
  // Add other fields as needed
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
      const careerData = {
        ...data,
        author_id: session.user.id,
        updated_at: new Date().toISOString(),
      };

      if (career) {
        // Update existing career
        const { error } = await supabase
          .from('careers')
          .update(careerData)
          .eq('id', career.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Career updated successfully',
        });
      } else {
        // Create new career
        const { error } = await supabase
          .from('careers')
          .insert([{
            ...careerData,
            created_at: new Date().toISOString(),
          }]);

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
            <FormField
              control={form.control}
              name="title"
              label="Career Title"
              type="text"
              placeholder="e.g., Software Engineer"
              required
            />
            <FormField
              control={form.control}
              name="description"
              label="Description"
              type="textarea"
              placeholder="Detailed description of the career path"
              required
            />
            <FormField
              control={form.control}
              name="industry"
              label="Industry"
              type="text"
              placeholder="e.g., Technology, Healthcare"
            />
            <FormField
              control={form.control}
              name="salary_range"
              label="Salary Range"
              type="text"
              placeholder="e.g., $70,000 - $120,000"
            />
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            {/* Add education, skills, tools fields here */}
            <div className="text-center py-8 text-muted-foreground">
              Additional requirement fields will be added here
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {/* Add work environment, job outlook fields here */}
            <div className="text-center py-8 text-muted-foreground">
              Career detail fields will be added here
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <FormField
              control={form.control}
              name="featured"
              label="Featured Career"
              type="checkbox"
              description="Check if this career should be featured"
            />
            <FormField
              control={form.control}
              name="status"
              label="Status"
              type="select"
              options={[
                { id: 'Pending', title: 'Pending' },
                { id: 'Approved', title: 'Approved' },
                { id: 'Rejected', title: 'Rejected' }
              ]}
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
