
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['completed', 'in_progress', 'on_hold']),
  start_date: z.string(),
  end_date: z.string(),
  technologies: z.array(z.string()),
  skills_used: z.array(z.string()),
  collaborators: z.array(z.string()),
  github_url: z.string().optional(),
  live_demo_url: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MenteeProjectFormProps {
  menteeId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MenteeProjectForm({ menteeId, onSuccess, onCancel }: MenteeProjectFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newTechnology, setNewTechnology] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newCollaborator, setNewCollaborator] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'completed',
      start_date: '',
      end_date: '',
      technologies: [],
      skills_used: [],
      collaborators: [],
      github_url: '',
      live_demo_url: '',
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const projectData = {
        mentee_id: menteeId,
        title: data.title,
        description: data.description,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
        technologies: data.technologies,
        skills_used: data.skills_used,
        collaborators: data.collaborators,
        github_url: data.github_url || '',
        live_demo_url: data.live_demo_url || '',
      };

      const { data: result, error } = await supabase
        .from('mentee_projects')
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentee-projects', menteeId] });
      toast({
        title: 'Success',
        description: 'Project added successfully',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add project',
        variant: 'destructive',
      });
      console.error('Error adding project:', error);
    },
  });

  const onSubmit = (data: FormData) => {
    createProjectMutation.mutate(data);
  };

  const addItem = (type: 'technologies' | 'skills_used' | 'collaborators', value: string, setter: (value: string) => void) => {
    if (!value.trim()) return;
    
    const current = form.getValues(type);
    if (!current.includes(value.trim())) {
      form.setValue(type, [...current, value.trim()]);
      setter('');
    }
  };

  const removeItem = (type: 'technologies' | 'skills_used' | 'collaborators', index: number) => {
    const current = form.getValues(type);
    form.setValue(type, current.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Project</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your project..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Technologies Section */}
            <div className="space-y-2">
              <FormLabel>Technologies Used</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add technology"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('technologies', newTechnology, setNewTechnology);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addItem('technologies', newTechnology, setNewTechnology)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('technologies').map((tech, index) => (
                  <Badge key={index} variant="secondary">
                    {tech}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2"
                      onClick={() => removeItem('technologies', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-2">
              <FormLabel>Skills Used</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('skills_used', newSkill, setNewSkill);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addItem('skills_used', newSkill, setNewSkill)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('skills_used').map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2"
                      onClick={() => removeItem('skills_used', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Collaborators Section */}
            <div className="space-y-2">
              <FormLabel>Collaborators</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add collaborator"
                  value={newCollaborator}
                  onChange={(e) => setNewCollaborator(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('collaborators', newCollaborator, setNewCollaborator);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addItem('collaborators', newCollaborator, setNewCollaborator)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('collaborators').map((collaborator, index) => (
                  <Badge key={index} variant="secondary">
                    {collaborator}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2"
                      onClick={() => removeItem('collaborators', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="github_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="live_demo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Demo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending ? 'Adding...' : 'Add Project'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
