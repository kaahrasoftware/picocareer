import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ContentUploadForm } from "@/components/forms/ContentUploadForm";

export default function CareerUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('careers')
        .insert([
          {
            ...data,
            author_id: user.id,
            status: 'Pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Career information has been submitted for review",
      });

      navigate('/career');
    } catch (error: any) {
      console.error('Error uploading career:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload career information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const careerFields = [
    {
      name: "title",
      label: "Career Title",
      type: "text",
      placeholder: "e.g., Software Engineer",
      required: true
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Detailed description of the career path",
      required: true
    },
    {
      name: "salary_range",
      label: "Salary Range",
      type: "text",
      placeholder: "e.g., $50,000 - $100,000"
    },
    {
      name: "image_url",
      label: "Image URL",
      type: "text",
      placeholder: "URL for career image"
    },
    {
      name: "academic_majors",
      label: "Academic Majors",
      type: "textarea",
      placeholder: "List relevant academic majors (comma-separated)"
    },
    {
      name: "required_skills",
      label: "Required Skills",
      type: "textarea",
      placeholder: "List required skills (comma-separated)"
    },
    {
      name: "required_tools",
      label: "Required Tools",
      type: "textarea",
      placeholder: "List required tools (comma-separated)"
    },
    {
      name: "job_outlook",
      label: "Job Outlook",
      type: "textarea",
      placeholder: "Describe the job outlook"
    },
    {
      name: "industry",
      label: "Industry",
      type: "text",
      placeholder: "e.g., Technology, Healthcare"
    },
    {
      name: "work_environment",
      label: "Work Environment",
      type: "textarea",
      placeholder: "Describe the work environment"
    },
    {
      name: "growth_potential",
      label: "Growth Potential",
      type: "textarea",
      placeholder: "Describe career growth potential"
    },
    {
      name: "keywords",
      label: "Keywords",
      type: "textarea",
      placeholder: "Enter relevant keywords (comma-separated)"
    },
    {
      name: "transferable_skills",
      label: "Transferable Skills",
      type: "textarea",
      placeholder: "List transferable skills (comma-separated)"
    },
    {
      name: "careers_to_consider_switching_to",
      label: "Alternative Careers",
      type: "textarea",
      placeholder: "List alternative careers to consider (comma-separated)"
    },
    {
      name: "required_education",
      label: "Required Education",
      type: "textarea",
      placeholder: "List required education levels (comma-separated)"
    },
    {
      name: "stress_levels",
      label: "Stress Levels",
      type: "text",
      placeholder: "Describe typical stress levels"
    },
    {
      name: "featured",
      label: "Featured Career",
      type: "checkbox",
      description: "Mark this career as featured"
    },
    {
      name: "rare",
      label: "Rare Career",
      type: "checkbox",
      description: "Mark this as a rare career opportunity"
    },
    {
      name: "popular",
      label: "Popular Career",
      type: "checkbox",
      description: "Mark this as a popular career choice"
    },
    {
      name: "new_career",
      label: "New Career",
      type: "checkbox",
      description: "Mark this as a new career field"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Career Information</h1>
      <ContentUploadForm 
        fields={careerFields} 
        onSubmit={handleSubmit}
      />
    </div>
  );
}