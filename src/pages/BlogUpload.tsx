import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { blogFormFields } from "@/components/forms/blog/BlogFormFields";
import { Card } from "@/components/ui/card";

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

      navigate("/blog");
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
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Blog Post</h1>
        <p className="text-muted-foreground mt-2">
          Share your knowledge and experiences with the community
        </p>
      </div>

      <Card className="p-6">
        <GenericUploadForm 
          fields={blogFormFields}
          onSubmit={handleSubmit}
          buttonText="Submit Blog Post"
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
}