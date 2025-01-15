import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ContentUploadForm } from "@/components/forms/ContentUploadForm";
import { useAuthSession } from "@/hooks/useAuthSession";
import { CareerFormValues } from "@/lib/validations/blog";

export default function CareerUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (data: CareerFormValues) => {
    try {
      setIsSubmitting(true);

      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // First get the profile id for the current user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not find user profile');
      }

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
        status: 'Pending' as const,
        author_id: profile.id
      };

      const { error } = await supabase
        .from('careers')
        .insert(formattedData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Career submitted successfully! It will be reviewed by our team.",
      });

      setFormKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Error submitting content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div>Please sign in to upload career information</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Upload Career Information</h1>
        <p className="text-gray-600 mb-6">
          Please provide detailed information about this career path to help others make informed decisions.
        </p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <ContentUploadForm 
            key={formKey}
            onSubmit={handleSubmit}
            buttonText={isSubmitting ? "Uploading..." : "Submit Career for Review"}
          />
        </div>
      </div>
    </div>
  );
}