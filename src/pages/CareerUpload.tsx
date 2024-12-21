import React from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ContentUploadForm } from "@/components/forms/ContentUploadForm";
import { careerFormFields } from "@/components/forms/career/CareerFormFields";

export default function CareerUpload() {
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
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

      // Process array fields
      const processedData = {
        ...data,
        required_education: data.required_education?.split(',').map((item: string) => item.trim()),
        required_skills: data.required_skills?.split(',').map((item: string) => item.trim()),
        required_tools: data.required_tools?.split(',').map((item: string) => item.trim()),
        keywords: data.keywords?.split(',').map((item: string) => item.trim()),
        transferable_skills: data.transferable_skills?.split(',').map((item: string) => item.trim()),
        careers_to_consider_switching_to: data.careers_to_consider_switching_to?.split(',').map((item: string) => item.trim()),
      };

      const { error } = await supabase
        .from('careers')
        .insert([processedData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Career has been uploaded successfully",
      });
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
      <ContentUploadForm 
        fields={careerFormFields}
        onSubmit={handleSubmit}
      />
    </div>
  );
}