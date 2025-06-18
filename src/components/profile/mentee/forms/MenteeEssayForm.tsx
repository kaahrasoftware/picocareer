
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  prompt_id: z.string().min(1, 'Please select a prompt'),
  response_text: z.string().optional(),
  is_draft: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface MenteeEssayFormProps {
  menteeId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MenteeEssayForm({ menteeId, onSuccess, onCancel }: MenteeEssayFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt_id: '',
      response_text: '',
      is_draft: true,
    },
  });

  const { data: prompts } = useQuery({
    queryKey: ['essay-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('essay_prompts')
        .select('*')
        .eq('is_active', true)
        .order('title');

      if (error) throw error;
      return data;
    },
  });

  const createEssayMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const essayData = {
        mentee_id: menteeId,
        prompt_id: data.prompt_id,
        response_text: data.response_text || '',
        is_draft: data.is_draft,
        word_count: data.response_text ? data.response_text.split(/\s+/).length : 0,
        version: 1,
      };

      const { data: result, error } = await supabase
        .from('mentee_essay_responses')
        .insert(essayData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentee-essays', menteeId] });
      toast({
        title: 'Success',
        description: 'Essay response saved successfully',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save essay response',
        variant: 'destructive',
      });
      console.error('Error saving essay:', error);
    },
  });

  const onSubmit = (data: FormData) => {
    createEssayMutation.mutate(data);
  };

  const watchedText = form.watch('response_text');
  const wordCount = watchedText ? watchedText.split(/\s+/).filter(word => word.length > 0).length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Essay Response</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prompt_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Essay Prompt *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an essay prompt" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {prompts?.map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                          <div>
                            <div className="font-medium">{prompt.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-md">
                              {prompt.prompt_text}
                            </div>
                          </div>
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
              name="response_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Essay Response</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your essay response here..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <div className="text-sm text-muted-foreground">
                    Word count: {wordCount}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_draft"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Save as Draft</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Mark this response as a draft for future editing
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={createEssayMutation.isPending}>
                {createEssayMutation.isPending ? 'Saving...' : 'Save Essay'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
