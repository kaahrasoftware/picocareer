import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { majorFormFields } from "@/components/forms/major/MajorFormFields";
import { formatMajorData } from "@/utils/majorFormatting";

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

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (!data.title?.trim()) {
        throw new Error('Title is required');
      }

      if (!data.description?.trim()) {
        throw new Error('Description is required');
      }

      // Format the data before submission
      const formattedData = formatMajorData(data);
      console.log('Formatted data:', formattedData);

      // Use RPC call to check and insert major
      const { data: result, error } = await supabase
        .rpc('check_and_insert_major', {
          major_data: formattedData
        });

      if (error) {
        console.error('Error from RPC:', error);
        if (error.message.includes('already exists')) {
          toast({
            title: "Major already exists",
            description: `A major with the title "${data.title}" already exists.`,
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Major information has been submitted for review",
      });

      navigate("/majors");
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