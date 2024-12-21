import React from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ContentUploadForm } from "@/components/forms/ContentUploadForm";
import { majorFormFields } from "@/components/forms/major/MajorFormFields";

export default function MajorUpload() {
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      // Check if major with same title exists
      const { data: existingMajor } = await supabase
        .from('majors')
        .select('id, title')
        .ilike('title', data.title)
        .single();

      if (existingMajor) {
        toast({
          title: "Error",
          description: `A major with the title "${data.title}" already exists.`,
          variant: "destructive",
        });
        return;
      }

      // Process array fields
      const processedData = {
        ...data,
        learning_objectives: data.learning_objectives?.split(',').map((item: string) => item.trim()),
        common_courses: data.common_courses?.split(',').map((item: string) => item.trim()),
        interdisciplinary_connections: data.interdisciplinary_connections?.split(',').map((item: string) => item.trim()),
        certifications_to_consider: data.certifications_to_consider?.split(',').map((item: string) => item.trim()),
        degree_levels: data.degree_levels?.split(',').map((item: string) => item.trim()),
        affiliated_programs: data.affiliated_programs?.split(',').map((item: string) => item.trim()),
        transferable_skills: data.transferable_skills?.split(',').map((item: string) => item.trim()),
        tools_knowledge: data.tools_knowledge?.split(',').map((item: string) => item.trim()),
        skill_match: data.skill_match?.split(',').map((item: string) => item.trim()),
        professional_associations: data.professional_associations?.split(',').map((item: string) => item.trim()),
        common_difficulties: data.common_difficulties?.split(',').map((item: string) => item.trim()),
        career_opportunities: data.career_opportunities?.split(',').map((item: string) => item.trim()),
        majors_to_consider_switching_to: data.majors_to_consider_switching_to?.split(',').map((item: string) => item.trim()),
      };

      const { error } = await supabase
        .from('majors')
        .insert([processedData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Major has been uploaded successfully",
      });
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
      <ContentUploadForm 
        fields={majorFormFields}
        onSubmit={handleSubmit}
      />
    </div>
  );
}