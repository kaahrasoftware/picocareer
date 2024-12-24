import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ContentUploadForm } from "@/components/forms/ContentUploadForm";
import { blogFormFields } from "@/components/forms/blog/BlogFormFields";

export default function BlogUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload blog posts",
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
        .from('blogs')
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
        description: "Blog post has been submitted for review",
      });

      window.location.reload();
    } catch (error: any) {
      console.error('Error uploading blog:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Blog Post</h1>
      <ContentUploadForm 
        fields={blogFormFields}
        onSubmit={handleSubmit}
      />
    </div>
  );
}