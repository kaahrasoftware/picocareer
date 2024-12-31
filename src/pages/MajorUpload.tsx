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

      const formattedData = formatMajorData(data);
      console.log('Formatted data:', formattedData);

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
        title: "Major submitted successfully",
        description: "Your major information has been submitted and will be reviewed by our team. You will be notified once it's approved.",
      });

      // Reset the form by forcing a re-render of GenericUploadForm with a new key
      setFormKey(prev => prev + 1);
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

  // Add a state to force form reset
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Upload New Major</h1>
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-blue-800">Guidelines for Submission</h2>
          <ul className="list-disc pl-5 space-y-1 text-blue-700">
            <li>Fill in all required fields marked with an asterisk (*)</li>
            <li>For array fields, enter one item per line</li>
            <li>Provide detailed and accurate information to help students make informed decisions</li>
            <li>Review all information before submission</li>
          </ul>
        </div>
        <GenericUploadForm 
          key={formKey}
          fields={majorFormFields}
          onSubmit={handleSubmit}
          buttonText="Submit Major for Review"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}