import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ContentUploadForm } from "@/components/forms/ContentUploadForm";
import { blogFormFields } from "@/components/forms/blog/BlogFormFields";

export default function BlogUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();

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
    try {
      // Check if blog with same title exists
      const { data: existingBlog } = await supabase
        .from('blogs')
        .select('id, title')
        .ilike('title', data.title)
        .single();

      if (existingBlog) {
        toast({
          title: "Error",
          description: `A blog post with the title "${data.title}" already exists.`,
          variant: "destructive",
        });
        return;
      }

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a blog post.",
          variant: "destructive",
        });
        return;
      }

      // Process array fields
      const processedData = {
        ...data,
        author_id: user.id,
        categories: data.categories?.split(',').map((item: string) => item.trim()),
        subcategories: data.subcategories?.split(',').map((item: string) => item.trim()),
      };

      const { error } = await supabase
        .from('blogs')
        .insert([processedData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading blog:', error);
      toast({
        title: "Error",
        description: "Failed to upload blog post. Please try again.",
        variant: "destructive",
      });
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