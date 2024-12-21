import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ContentUploadForm } from "@/components/forms/ContentUploadForm";
import { majorFormFields } from "@/components/forms/major/MajorFormFields";

export default function MajorUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload major information",
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

      // Check if major with same title exists
      const { data: existingMajor, error: searchError } = await supabase
        .from('majors')
        .select('title')
        .ilike('title', data.title.trim())
        .maybeSingle();

      if (searchError) {
        console.error('Error checking existing major:', searchError);
        toast({
          title: "Database Error",
          description: "Failed to check for existing major. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      if (existingMajor) {
        toast({
          title: "Duplicate Major Found",
          description: `A major titled "${data.title}" already exists in the database.`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      const processedData = {
        title: data.title.trim(),
        description: data.description.trim(),
        featured: data.featured || false,
        learning_objectives: data.learning_objectives ? data.learning_objectives.split(',').map((item: string) => item.trim()) : [],
        common_courses: data.common_courses ? data.common_courses.split(',').map((item: string) => item.trim()) : [],
        interdisciplinary_connections: data.interdisciplinary_connections ? data.interdisciplinary_connections.split(',').map((item: string) => item.trim()) : [],
        job_prospects: data.job_prospects || null,
        certifications_to_consider: data.certifications_to_consider ? data.certifications_to_consider.split(',').map((item: string) => item.trim()) : [],
        degree_levels: data.degree_levels ? data.degree_levels.split(',').map((item: string) => item.trim()) : [],
        affiliated_programs: data.affiliated_programs ? data.affiliated_programs.split(',').map((item: string) => item.trim()) : [],
        gpa_expectations: data.gpa_expectations ? parseFloat(data.gpa_expectations) : null,
        transferable_skills: data.transferable_skills ? data.transferable_skills.split(',').map((item: string) => item.trim()) : [],
        tools_knowledge: data.tools_knowledge ? data.tools_knowledge.split(',').map((item: string) => item.trim()) : [],
        potential_salary: data.potential_salary || null,
        passion_for_subject: data.passion_for_subject || null,
        skill_match: data.skill_match ? data.skill_match.split(',').map((item: string) => item.trim()) : [],
        professional_associations: data.professional_associations ? data.professional_associations.split(',').map((item: string) => item.trim()) : [],
        global_applicability: data.global_applicability || null,
        common_difficulties: data.common_difficulties ? data.common_difficulties.split(',').map((item: string) => item.trim()) : [],
        majors_to_consider_switching_to: data.majors_to_consider_switching_to ? data.majors_to_consider_switching_to.split(',').map((item: string) => item.trim()) : [],
        career_opportunities: data.career_opportunities ? data.career_opportunities.split(',').map((item: string) => item.trim()) : [],
        intensity: data.intensity || null,
        stress_level: data.stress_level || null,
        dropout_rates: data.dropout_rates || null
      };

      const { error: insertError } = await supabase
        .from('majors')
        .insert([processedData]);

      if (insertError) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload major information. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
        throw insertError;
      }

      toast({
        title: "Upload Successful! 🎉",
        description: `Major "${data.title}" has been added to the database.`,
        variant: "default",
        duration: 5000,
      });
      
      // Reset the form by refreshing the page
      window.location.reload();
    } catch (error: any) {
      console.error('Error uploading major:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload major information. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upload Major Information</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share details about an academic major to help students make informed decisions.
        </p>
      </div>
      <ContentUploadForm 
        fields={majorFormFields}
        onSubmit={handleSubmit}
      />
    </div>
  );
}