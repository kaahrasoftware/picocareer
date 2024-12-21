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
      const { error } = await supabase
        .from('careers')
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Career information has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading career:', error);
      toast({
        title: "Error",
        description: "Failed to upload career information. Please try again.",
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