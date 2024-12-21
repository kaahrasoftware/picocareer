import React from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

type CareerFormData = {
  title: string;
  description: string;
  salary_range: string;
  image_url: string;
  featured: boolean;
  required_education: string;
  required_skills: string;
  required_tools: string;
  job_outlook: string;
  industry: string;
  work_environment: string;
  growth_potential: string;
  keywords: string;
  transferable_skills: string;
  stress_levels: number;
  careers_to_consider_switching_to: string;
};

export default function CareerUpload() {
  const { toast } = useToast();
  const form = useForm<CareerFormData>();

  const onSubmit = async (data: CareerFormData) => {
    try {
      // Check if career with same title exists
      const { data: existingCareer } = await supabase
        .from('careers')
        .select('id, title')
        .ilike('title', data.title)
        .single();

      if (existingCareer) {
        toast({
          title: "Error",
          description: `A career with the title "${data.title}" already exists.`,
          variant: "destructive",
        });
        return;
      }

      // Convert string arrays to actual arrays
      const processedData = {
        ...data,
        required_education: data.required_education.split(',').map(item => item.trim()),
        required_skills: data.required_skills.split(',').map(item => item.trim()),
        required_tools: data.required_tools.split(',').map(item => item.trim()),
        keywords: data.keywords.split(',').map(item => item.trim()),
        transferable_skills: data.transferable_skills.split(',').map(item => item.trim()),
        careers_to_consider_switching_to: data.careers_to_consider_switching_to.split(',').map(item => item.trim()),
      };

      const { error } = await supabase
        .from('careers')
        .insert([processedData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Career has been uploaded successfully",
      });

      form.reset();
    } catch (error) {
      console.error('Error uploading career:', error);
      toast({
        title: "Error",
        description: "Failed to upload career. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Career Information</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Software Engineer" required />
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
                  <Textarea {...field} placeholder="Detailed description of the career" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="$50,000 - $100,000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://example.com/image.jpg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Career</FormLabel>
                  <FormDescription>
                    Show this career in featured sections
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="required_education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Education</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Bachelor's Degree, Master's Degree (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="required_skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Programming, Problem Solving (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="required_tools"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Tools</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Git, VS Code (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="job_outlook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Outlook</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Future prospects and growth expectations" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Technology, Healthcare, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="work_environment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Environment</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Description of typical work environment" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="growth_potential"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Growth Potential</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Career advancement opportunities" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="tech, coding, development (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transferable_skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transferable Skills</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Communication, Leadership (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stress_levels"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stress Levels (1-10)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="1" 
                    max="10" 
                    placeholder="5"
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="careers_to_consider_switching_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Careers</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Data Scientist, DevOps Engineer (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">Upload Career</Button>
        </form>
      </Form>
    </div>
  );
}