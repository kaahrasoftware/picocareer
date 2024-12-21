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

type MajorFormData = {
  title: string;
  description: string;
  featured: boolean;
  learning_objectives: string;
  common_courses: string;
  interdisciplinary_connections: string;
  job_prospects: string;
  certifications_to_consider: string;
  degree_levels: string;
  affiliated_programs: string;
  gpa_expectations: number;
  transferable_skills: string;
  tools_knowledge: string;
  potential_salary: string;
  passion_for_subject: string;
  skill_match: string;
  professional_associations: string;
  global_applicability: string;
  common_difficulties: string;
  career_opportunities: string;
  intensity: string;
  stress_level: string;
  dropout_rates: string;
  majors_to_consider_switching_to: string;
};

export default function MajorUpload() {
  const { toast } = useToast();
  const form = useForm<MajorFormData>();

  const onSubmit = async (data: MajorFormData) => {
    try {
      // Convert string arrays to actual arrays
      const processedData = {
        ...data,
        learning_objectives: data.learning_objectives.split(',').map(item => item.trim()),
        common_courses: data.common_courses.split(',').map(item => item.trim()),
        interdisciplinary_connections: data.interdisciplinary_connections.split(',').map(item => item.trim()),
        certifications_to_consider: data.certifications_to_consider.split(',').map(item => item.trim()),
        degree_levels: data.degree_levels.split(',').map(item => item.trim()),
        affiliated_programs: data.affiliated_programs.split(',').map(item => item.trim()),
        transferable_skills: data.transferable_skills.split(',').map(item => item.trim()),
        tools_knowledge: data.tools_knowledge.split(',').map(item => item.trim()),
        skill_match: data.skill_match.split(',').map(item => item.trim()),
        professional_associations: data.professional_associations.split(',').map(item => item.trim()),
        common_difficulties: data.common_difficulties.split(',').map(item => item.trim()),
        career_opportunities: data.career_opportunities.split(',').map(item => item.trim()),
        majors_to_consider_switching_to: data.majors_to_consider_switching_to.split(',').map(item => item.trim()),
      };

      const { error } = await supabase
        .from('majors')
        .insert([processedData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Major has been uploaded successfully",
      });

      form.reset();
    } catch (error) {
      console.error('Error uploading major:', error);
      toast({
        title: "Error",
        description: "Failed to upload major. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Major Information</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Computer Science" required />
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
                  <Textarea {...field} placeholder="Detailed description of the major" required />
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
                  <FormLabel>Featured Major</FormLabel>
                  <FormDescription>
                    Show this major in featured sections
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="learning_objectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Learning Objectives</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Problem solving, Critical thinking (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="common_courses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Common Courses</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Calculus, Data Structures (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interdisciplinary_connections"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interdisciplinary Connections</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Mathematics, Physics (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="job_prospects"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Prospects</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Description of career opportunities and job market" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="certifications_to_consider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recommended Certifications</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="AWS Certified, Google Cloud (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="degree_levels"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Degree Levels</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Bachelor's, Master's (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="affiliated_programs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Affiliated Programs</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Research programs, Industry partnerships (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gpa_expectations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GPA Expectations</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="4.0" 
                    placeholder="3.0"
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
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
            name="tools_knowledge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tools and Technologies</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Python, Java (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="potential_salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potential Salary Range</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="$60,000 - $120,000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passion_for_subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passion for Subject</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="High interest in technology and problem-solving" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skill_match"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Mathematics, Logic (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="professional_associations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Associations</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="IEEE, ACM (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="global_applicability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Global Applicability</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Description of worldwide career opportunities" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="common_difficulties"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Common Difficulties</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Complex mathematics, Time management (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="career_opportunities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Career Opportunities</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Software Engineer, Data Scientist (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intensity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program Intensity</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="High, Medium, or Low" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stress_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stress Level</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="High, Medium, or Low" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dropout_rates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dropout Rates</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 15%" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="majors_to_consider_switching_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternative Majors to Consider</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Information Technology, Data Science (comma-separated)" />
                </FormControl>
                <FormDescription>Enter comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">Upload Major</Button>
        </form>
      </Form>
    </div>
  );
}