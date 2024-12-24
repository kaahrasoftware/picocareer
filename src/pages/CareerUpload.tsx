import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ContentUploadForm } from "@/components/forms/ContentUploadForm";
import { careerFormFields } from "@/components/forms/career/CareerFormFields";

export default function CareerUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload career information",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSubmit = async (data: any) => {
    try {
      // Validate required fields
      if (!data.title?.trim() || !data.description?.trim()) {
        toast({
          title: "Missing Required Fields",
          description: "Title and description are required fields",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      // Check if career with same title exists
      const { data: existingCareer, error: searchError } = await supabase
        .from('careers')
        .select('title')
        .ilike('title', data.title.trim())
        .maybeSingle();

      if (searchError) {
        console.error('Error checking existing career:', searchError);
        toast({
          title: "Database Error",
          description: "Failed to check for existing career. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      if (existingCareer) {
        toast({
          title: "Duplicate Career Found",
          description: `A career titled "${data.title}" already exists in the database.`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      // Process array fields and ensure they're not undefined
      const processedData = {
        title: data.title.trim(),
        description: data.description.trim(),
        salary_range: data.salary_range || null,
        image_url: data.image_url || null,
        featured: data.featured || false,
        academic_majors: data.academic_majors ? data.academic_majors.split(',').map((item: string) => item.trim()) : [],
        required_education: data.required_education ? data.required_education.split(',').map((item: string) => item.trim()) : [],
        required_skills: data.required_skills ? data.required_skills.split(',').map((item: string) => item.trim()) : [],
        required_tools: data.required_tools ? data.required_tools.split(',').map((item: string) => item.trim()) : [],
        job_outlook: data.job_outlook || null,
        industry: data.industry || null,
        work_environment: data.work_environment || null,
        growth_potential: data.growth_potential || null,
        keywords: data.keywords ? data.keywords.split(',').map((item: string) => item.trim()) : [],
        transferable_skills: data.transferable_skills ? data.transferable_skills.split(',').map((item: string) => item.trim()) : [],
        stress_levels: data.stress_levels ? data.stress_levels.toString() : null,
        careers_to_consider_switching_to: data.careers_to_consider_switching_to ? 
          data.careers_to_consider_switching_to.split(',').map((item: string) => item.trim()) : []
      };

      const { error: insertError } = await supabase
        .from('careers')
        .insert([processedData]);

      if (insertError) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload career information. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
        throw insertError;
      }

      toast({
        title: "Upload Successful! 🎉",
        description: `Career "${data.title}" has been added to the database.`,
        variant: "default",
        duration: 5000,
      });
      
      // Reset the form by refreshing the page
      window.location.reload();
    } catch (error: any) {
      console.error('Error uploading career:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload career information. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upload Career Information</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add a new career path to help guide others in their professional journey.
        </p>
      </div>
      <ContentUploadForm 
        fields={careerFormFields}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
