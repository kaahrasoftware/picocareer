import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { majorFormFields } from "@/components/forms/major/MajorFormFields";

export default function MajorUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const formatArrayData = (data: any) => {
    const arrayFields = [
      'learning_objectives',
      'common_courses',
      'interdisciplinary_connections',
      'certifications_to_consider',
      'degree_levels',
      'affiliated_programs',
      'transferable_skills',
      'tools_knowledge',
      'skill_match',
      'professional_associations',
      'common_difficulties',
      'career_opportunities',
      'majors_to_consider_switching_to'
    ];

    const formattedData = { ...data };
    
    // Format array fields
    arrayFields.forEach(field => {
      if (formattedData[field]) {
        if (typeof formattedData[field] === 'string') {
          // Convert comma-separated string to array
          formattedData[field] = formattedData[field]
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
        } else if (!Array.isArray(formattedData[field])) {
          formattedData[field] = [];
        }
      } else {
        formattedData[field] = [];
      }
    });

    return formattedData;
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (!data.title) {
        throw new Error('Title is required');
      }

      // First check if a major with this title already exists
      const { data: existingMajor, error: searchError } = await supabase
        .from('majors')
        .select('id, title')
        .eq('title', data.title)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existingMajor) {
        toast({
          title: "Major already exists",
          description: `A major with the title "${data.title}" already exists.`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Format the data before insertion
      const formattedData = formatArrayData(data);

      // If no existing major, proceed with insertion
      const { error: insertError } = await supabase
        .from('majors')
        .insert([{
          ...formattedData,
          status: 'Pending'
        }]);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Major information has been submitted for review",
      });

      window.location.reload();
    } catch (error: any) {
      console.error('Error uploading major:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload major information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Major</h1>
      <GenericUploadForm 
        fields={majorFormFields}
        onSubmit={handleSubmit}
        buttonText="Upload Major"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}