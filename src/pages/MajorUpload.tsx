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
      const { error } = await supabase
        .from('majors')
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Major information has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading major:', error);
      toast({
        title: "Error",
        description: "Failed to upload major information. Please try again.",
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