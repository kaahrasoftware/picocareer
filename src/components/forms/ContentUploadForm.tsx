import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { careerFormSchema, CareerFormValues } from "@/lib/validations/blog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BasicCareerInfo } from "./career/BasicCareerInfo";
import { SkillsAndRequirements } from "./career/SkillsAndRequirements";
import { CareerDetails } from "./career/CareerDetails";
import { CareerMetadata } from "./career/CareerMetadata";

interface ContentUploadFormProps {
  onSubmit?: (data: CareerFormValues) => Promise<void>;
  buttonText?: string;
}

export function ContentUploadForm({ onSubmit, buttonText = "Upload Career" }: ContentUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CareerFormValues>({
    resolver: zodResolver(careerFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      salary_range: "",
      featured: false,
      academic_majors: "",
      required_skills: "",
      required_tools: "",
      job_outlook: "",
      industry: "",
      work_environment: "",
      growth_potential: "",
      keywords: "",
      transferable_skills: "",
      careers_to_consider_switching_to: "",
      required_education: "",
      stress_levels: "",
      rare: false,
      popular: false,
      new_career: false,
      status: 'Approved'
    },
  });

  const handleSubmit = async (data: CareerFormValues) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        const formattedData = {
          title: data.title,
          description: data.description,
          image_url: data.image_url,
          salary_range: data.salary_range,
          featured: data.featured,
          academic_majors: data.academic_majors?.split(',').map(item => item.trim()).filter(Boolean) || [],
          required_skills: data.required_skills?.split(',').map(item => item.trim()).filter(Boolean) || [],
          required_tools: data.required_tools?.split(',').map(item => item.trim()).filter(Boolean) || [],
          job_outlook: data.job_outlook,
          industry: data.industry,
          work_environment: data.work_environment,
          growth_potential: data.growth_potential,
          keywords: data.keywords?.split(',').map(item => item.trim()).filter(Boolean) || [],
          transferable_skills: data.transferable_skills?.split(',').map(item => item.trim()).filter(Boolean) || [],
          careers_to_consider_switching_to: data.careers_to_consider_switching_to?.split(',').map(item => item.trim()).filter(Boolean) || [],
          required_education: data.required_education?.split(',').map(item => item.trim()).filter(Boolean) || [],
          stress_levels: data.stress_levels,
          rare: data.rare,
          popular: data.popular,
          new_career: data.new_career,
          status: 'Approved' as const
        };

        const { error } = await supabase
          .from('careers')
          .insert([formattedData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Career uploaded successfully!",
          variant: "default"
        });

        form.reset();
      }
    } catch (error: any) {
      console.error('Error submitting content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="space-y-6">
          <BasicCareerInfo control={form.control} />
          <SkillsAndRequirements control={form.control} />
          <CareerDetails control={form.control} />
          <CareerMetadata control={form.control} />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Uploading..." : buttonText}
        </Button>
      </form>
    </Form>
  );
}